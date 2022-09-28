import { Buffer } from 'buffer'

import { InternalError } from '../errors/InternalError'
import { UnsafeFilepathError } from '../errors'
import { BufferCursor } from '../utils/BufferCursor'
import { comparePath } from '../utils/comparePath'
import { normalizeStats } from '../utils/normalizeStats'
import { shasum } from '../utils/shasum'
import { IndexEntry, IndexEntryFlags } from './IndexEntry'
import { Stat } from './FsClient'

// Extract 1-bit assume-valid, 1-bit extended flag, 2-bit merge state flag, 12-bit path length flag
function parseCacheEntryFlags(bits: number): IndexEntryFlags {
  return {
    assumeValid: Boolean(bits & 0b1000000000000000),
    extended: Boolean(bits & 0b0100000000000000),
    stage: (bits & 0b0011000000000000) >> 12,
    nameLength: bits & 0b0000111111111111,
  }
}

function renderCacheEntryFlags(entry: IndexEntry) {
  const flags = entry.flags
  // 1-bit extended flag (must be zero in version 2)
  flags.extended = false
  // 12-bit name length if the length is less than 0xFFF; otherwise 0xFFF
  // is stored in this field.
  flags.nameLength = Math.min(Buffer.from(entry.path).length, 0xfff)
  return (
    (flags.assumeValid ? 0b1000000000000000 : 0) +
    (flags.extended ? 0b0100000000000000 : 0) +
    ((flags.stage & 0b11) << 12) +
    (flags.nameLength & 0b111111111111)
  )
}

export class GitIndex {
  public _dirty: boolean
  private readonly _entries: Map<string, IndexEntry>

  /*::
   _entries: Map<string, CacheEntry>
   _dirty: boolean // Used to determine if index needs to be saved to filesystem
   */
  constructor(entries: Map<string, IndexEntry> | null) {
    this._dirty = false
    this._entries = entries || new Map<string, IndexEntry>()
  }

  static async from(buffer: Buffer | null) {
    if (Buffer.isBuffer(buffer)) {
      return GitIndex.fromBuffer(buffer)
    } else if (buffer === null) {
      return new GitIndex(null)
    } else {
      throw new InternalError('invalid type passed to GitIndex.from')
    }
  }

  static async fromBuffer(buffer: Buffer) {
    // Verify shasum
    const shaComputed = await shasum(buffer.slice(0, -20))
    const shaClaimed = buffer.slice(-20).toString('hex')
    if (shaClaimed !== shaComputed) {
      throw new InternalError(
        `Invalid checksum in GitIndex buffer: expected ${shaClaimed} but saw ${shaComputed}`
      )
    }
    const reader = new BufferCursor(buffer)
    const _entries = new Map<string, IndexEntry>()
    const magic = reader.toString('utf8', 4)
    if (magic !== 'DIRC') {
      throw new InternalError(`Inavlid dircache magic file number: ${magic}`)
    }
    const version = reader.readUInt32BE()
    if (version !== 2) {
      throw new InternalError(`Unsupported dircache version: ${version}`)
    }
    const numEntries = reader.readUInt32BE()
    let i = 0

    while (!reader.eof() && i < numEntries) {
      const ctimeSeconds = reader.readUInt32BE()
      const ctimeNanoseconds = reader.readUInt32BE()
      const mtimeSeconds = reader.readUInt32BE()
      const mtimeNanoseconds = reader.readUInt32BE()
      const dev = reader.readUInt32BE()
      const ino = reader.readUInt32BE()
      const mode = reader.readUInt32BE()
      const uid = reader.readUInt32BE()
      const gid = reader.readUInt32BE()
      const size = reader.readUInt32BE()
      const oid = reader.slice(20).toString('hex')
      const flags = parseCacheEntryFlags(reader.readUInt16BE())
      // TODO: handle if (version === 3 && entry.flags.extended)
      const pathlength = buffer.indexOf(0, reader.tell() + 1) - reader.tell()
      if (pathlength < 1) {
        throw new InternalError(`Got a path length of: ${pathlength}`)
      }
      // TODO: handle pathnames larger than 12 bits
      const path = reader.toString('utf8', pathlength)

      // Prevent malicious paths like "..\foo"
      if (path.includes('..\\') || path.includes('../')) {
        throw new UnsafeFilepathError(path)
      }

      const entry: IndexEntry = {
        ctimeSeconds, ctimeNanoseconds, mtimeSeconds, mtimeNanoseconds, dev, ino, mode, uid, gid, size, oid, flags, path
      }

      // The next bit is awkward. We expect 1 to 8 null characters
      // such that the total size of the entry is a multiple of 8 bits.
      // (Hence subtract 12 bytes for the header.)
      let padding = 8 - ((reader.tell() - 12) % 8)
      if (padding === 0) padding = 8
      while (padding--) {
        const tmp = reader.readUInt8()
        if (tmp !== 0) {
          throw new InternalError(
            `Expected 1-8 null characters but got '${tmp}' after ${entry.path}`
          )
        } else if (reader.eof()) {
          throw new InternalError('Unexpected end of file')
        }
      }
      // end of awkward part
      _entries.set(entry.path, entry)
      i++
    }

    return new GitIndex(_entries)
  }

  get entries() {
    return [...this._entries.values()].sort(comparePath)
  }

  get entriesMap() {
    return this._entries
  }

  *[Symbol.iterator]() {
    for (const entry of this.entries) {
      yield entry
    }
  }

  insert(
    { filepath, stats, oid }:
    { filepath: string, stats: Stat, oid: string }) {
    const normalizedStats = normalizeStats(stats)
    const bfilepath = Buffer.from(filepath)
    const entry: IndexEntry = {
      ctimeSeconds: normalizedStats.ctimeSeconds,
      ctimeNanoseconds: normalizedStats.ctimeNanoseconds,
      mtimeSeconds: normalizedStats.mtimeSeconds,
      mtimeNanoseconds: normalizedStats.mtimeNanoseconds,
      dev: normalizedStats.dev,
      ino: normalizedStats.ino,
      // We provide a fallback value for `mode` here because not all fs
      // implementations assign it, but we use it in GitTree.
      // '100644' is for a "regular non-executable file"
      mode: normalizedStats.mode || 0o100644,
      uid: normalizedStats.uid,
      gid: normalizedStats.gid,
      size: normalizedStats.size,
      path: filepath,
      oid: oid,
      flags: {
        assumeValid: false,
        extended: false,
        stage: 0,
        nameLength: bfilepath.length < 0xfff ? bfilepath.length : 0xfff,
      },
    }
    this._entries.set(entry.path, entry)
    this._dirty = true
  }

  delete({ filepath }: { filepath: string }) {
    if (this._entries.has(filepath)) {
      this._entries.delete(filepath)
    } else {
      for (const key of this._entries.keys()) {
        if (key.startsWith(filepath + '/')) {
          this._entries.delete(key)
        }
      }
    }
    this._dirty = true
  }

  clear() {
    this._entries.clear()
    this._dirty = true
  }

  render() {
    return this.entries
      .map(entry => `${entry.mode.toString(8)} ${entry.oid}    ${entry.path}`)
      .join('\n')
  }

  async toObject() {
    const header = Buffer.alloc(12)
    const writer = new BufferCursor(header)
    writer.write('DIRC', 4, 'utf8')
    writer.writeUInt32BE(2)
    writer.writeUInt32BE(this.entries.length)
    const body = Buffer.concat(
      this.entries.map(entry => {
        const bpath = Buffer.from(entry.path)
        // the fixed length + the filename + at least one null char => align by 8
        const length = Math.ceil((62 + bpath.length + 1) / 8) * 8
        const written = Buffer.alloc(length)
        const writer = new BufferCursor(written)
        const normalizedStat = normalizeStats(entry)
        writer.writeUInt32BE(normalizedStat.ctimeSeconds)
        writer.writeUInt32BE(normalizedStat.ctimeNanoseconds)
        writer.writeUInt32BE(normalizedStat.mtimeSeconds)
        writer.writeUInt32BE(normalizedStat.mtimeNanoseconds)
        writer.writeUInt32BE(normalizedStat.dev)
        writer.writeUInt32BE(normalizedStat.ino)
        writer.writeUInt32BE(normalizedStat.mode)
        writer.writeUInt32BE(normalizedStat.uid)
        writer.writeUInt32BE(normalizedStat.gid)
        writer.writeUInt32BE(normalizedStat.size)
        writer.write(entry.oid, 20, 'hex')
        writer.writeUInt16BE(renderCacheEntryFlags(entry))
        writer.write(entry.path, bpath.length, 'utf8')
        return written
      })
    )
    const main = Buffer.concat([header, body])
    const sum = await shasum(main)
    return Buffer.concat([main, Buffer.from(sum, 'hex')])
  }
}
