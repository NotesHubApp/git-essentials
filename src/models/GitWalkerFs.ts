import { FileSystem } from './FileSystem'
import { Cache } from '../models/Cache'
import { GitIndexManager } from '../managers/GitIndexManager'
import { compareStats } from '../utils/compareStats'
import { join } from '../utils/join'
import { normalizeStats } from '../utils/normalizeStats'
import { shasum } from '../utils/shasum'
import { GitObject } from './GitObject.js'
import { GitWalkder, WalkerEntry, WalkerEntryConstructor, WalkerEntryType } from './Walker'
import { NormalizedStat } from './NormalizedStat'
import { Stat } from './IBackend'


export class GitWalkerFs implements GitWalkder {
  private readonly fs: FileSystem
  private readonly cache: Cache
  private readonly dir: string
  private readonly gitdir: string
  public readonly ConstructEntry: WalkerEntryConstructor

  constructor(
    { fs, dir, gitdir, cache }:
    { fs: FileSystem, dir: string, gitdir: string, cache: Cache }) {
    this.fs = fs
    this.cache = cache
    this.dir = dir
    this.gitdir = gitdir

    const walker = this
    this.ConstructEntry = class WorkdirEntry {
      _fullpath: string
      _type: boolean
      _mode: boolean
      _stat: boolean
      _content: boolean
      _oid: boolean
      _actualSize: undefined | number

      constructor(fullpath: string) {
        this._fullpath = fullpath
        this._type = false
        this._mode = false
        this._stat = false
        this._content = false
        this._oid = false
      }

      async type() {
        return walker.type(this)
      }

      async mode() {
        return walker.mode(this)
      }

      async stat() {
        return walker.stat(this)
      }

      async content() {
        return walker.content(this)
      }

      async oid() {
        return walker.oid(this)
      }
    }
  }

  async readdir(entry: WalkerEntry) {
    const filepath = entry._fullpath
    const { fs, dir } = this
    const names = await fs.readdir(join(dir, filepath))
    if (names === null) return null
    return names.map(name => join(filepath, name))
  }

  async type(entry: WalkerEntry) {
    if (entry._type === false) {
      await entry.stat()
    }
    return entry._type as WalkerEntryType
  }

  async mode(entry: WalkerEntry) {
    if (entry._mode === false) {
      await entry.stat()
    }
    return entry._mode as number
  }

  async stat(entry: WalkerEntry) {
    if (entry._stat === false) {
      const { fs, dir } = this
      let stat = await fs.lstat(`${dir}/${entry._fullpath}`)
      if (!stat) {
        throw new Error(
          `ENOENT: no such file or directory, lstat '${entry._fullpath}'`
        )
      }
      let type: WalkerEntryType = stat.isDirectory() ? 'tree' : 'blob'
      if (type === 'blob' && !stat.isFile() && !stat.isSymbolicLink()) {
        type = 'special'
      }

      entry._type = type
      const normalizeStat = normalizeStats(stat)
      entry._mode = normalizeStat.mode
      // workaround for a BrowserFS edge case
      if (normalizeStat.size === -1 && entry._actualSize) {
        normalizeStat.size = entry._actualSize
      }
      entry._stat = normalizeStat
    }

    return entry._stat as NormalizedStat
  }

  async content(entry: WalkerEntry) {
    if (entry._content === false) {
      const { fs, dir } = this

      if ((await entry.type()) === 'tree') {
        entry._content = undefined
      } else {
        const content = (await fs.read(`${dir}/${entry._fullpath}`)) as Buffer
        // workaround for a BrowserFS edge case
        entry._actualSize = content.length

        const stat = entry._stat as NormalizedStat
        if (stat && stat.size === -1) {
          stat.size = entry._actualSize
        }

        entry._content = new Uint8Array(content)
      }
    }

    return entry._content as Uint8Array
  }

  async oid(entry: WalkerEntry) {
    if (entry._oid === false) {
      const { fs, gitdir, cache } = this
      let oid: string | undefined

      // See if we can use the SHA1 hash in the index.
      await GitIndexManager.acquire({ fs, gitdir, cache }, async function(index) {
        const stage = index.entriesMap.get(entry._fullpath)
        const stats = (await entry.stat())!

        if (!stage || compareStats(stats, stage)) {
          const content = await entry.content()

          if (content === undefined) {
            oid = undefined
          } else {
            oid = await shasum(
              GitObject.wrap({ type: 'blob', object: (await entry.content())! })
            )
            if (stage && oid === stage.oid) {
              index.insert({ filepath: entry._fullpath, stats, oid: oid })
            }
          }
        } else {
          // Use the index SHA1 rather than compute it
          oid = stage.oid
        }
      })

      entry._oid = oid!
    }

    return entry._oid as string
  }
}
