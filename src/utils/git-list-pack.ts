// My version of git-list-pack - roughly 15x faster than the original
// It's used slightly differently - instead of returning a through stream it wraps a stream.
// (I tried to make it API identical, but that ended up being 2x slower than this version.)
import { Buffer } from 'buffer'

import pako from 'pako'

import { InternalError } from '../errors/InternalError'
import { StreamReader } from '../utils/StreamReader'

type Data = {
  data: string
  type: number
  num: number
  offset: number
  end: number
  reference: Buffer | undefined
  ofs: number | undefined
}

export async function listpack(stream: Buffer[], onData: (data: Data) => Promise<void>) {
  const reader = new StreamReader(stream)
  const PACKBuff = (await reader.read(4))!
  const PACK = PACKBuff.toString('utf8')
  if (PACK !== 'PACK') {
    throw new InternalError(`Invalid PACK header '${PACK}'`)
  }

  const versionBuff = (await reader.read(4))!
  const version = versionBuff.readUInt32BE(0)
  if (version !== 2) {
    throw new InternalError(`Invalid packfile version: ${version}`)
  }

  const numObjectsBuff = (await reader.read(4))!
  let numObjects = numObjectsBuff.readUInt32BE(0)
  // If (for some godforsaken reason) this is an empty packfile, abort now.
  if (numObjects < 1) return

  while (!reader.eof() && numObjects--) {
    const offset = reader.tell()
    const { type, length, ofs, reference } = await parseHeader(reader)
    const inflator = new pako.Inflate()
    while (!inflator.result) {
      const chunk = (await reader.chunk())!
      if (reader.ended) break
      inflator.push(chunk, false)
      if (inflator.err) {
        throw new InternalError(`Pako error: ${inflator.msg}`)
      }
      if (inflator.result) {
        if (inflator.result.length !== length) {
          throw new InternalError(
            `Inflated object size is different from that stated in packfile.`
          )
        }

        // Backtrack parser to where deflated data ends
        await reader.undo()
        await reader.read(chunk.length - (inflator as any).strm.avail_in) // TODO: TAlex looks like typing library does not define this
        const end = reader.tell()
        await onData({
          data: inflator.result,
          type,
          num: numObjects,
          offset,
          end,
          reference,
          ofs,
        })
      }
    }
  }
}

async function parseHeader(reader: StreamReader) {
  // Object type is encoded in bits 654
  let byte = (await reader.byte())!
  const type = (byte >> 4) & 0b111
  // The length encoding get complicated.
  // Last four bits of length is encoded in bits 3210
  let length = byte & 0b1111
  // Whether the next byte is part of the variable-length encoded number
  // is encoded in bit 7
  if (byte & 0b10000000) {
    let shift = 4
    do {
      byte = (await reader.byte())!
      length |= (byte & 0b01111111) << shift
      shift += 7
    } while (byte & 0b10000000)
  }
  // Handle deltified objects
  let ofs
  let reference
  if (type === 6) {
    let shift = 0
    ofs = 0
    const bytes = []
    do {
      byte = (await reader.byte())!
      ofs |= (byte & 0b01111111) << shift
      shift += 7
      bytes.push(byte)
    } while (byte & 0b10000000)
    reference = Buffer.from(bytes)
  }
  if (type === 7) {
    const buf = await reader.read(20)
    reference = buf
  }
  return { type, length, ofs, reference }
}
