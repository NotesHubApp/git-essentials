import { Buffer } from 'buffer'

// Modeled after https://github.com/tjfontaine/node-buffercursor
// but with the goal of being much lighter weight.
export class BufferCursor {
  private _start: number;

  constructor(public readonly buffer: Buffer) {
    this._start = 0
  }

  eof() {
    return this._start >= this.buffer.length
  }

  tell() {
    return this._start
  }

  seek(n: number) {
    this._start = n
  }

  slice(n: number) {
    const r = this.buffer.slice(this._start, this._start + n)
    this._start += n
    return r
  }

  toString(enc: BufferEncoding, length: number) {
    const r = this.buffer.toString(enc, this._start, this._start + length)
    this._start += length
    return r
  }

  write(value: string, length: number, enc: BufferEncoding) {
    const r = this.buffer.write(value, this._start, length, enc)
    this._start += length
    return r
  }

  copy(source: Buffer, start?: number, end?: number) {
    const r = source.copy(this.buffer, this._start, start, end)
    this._start += r
    return r
  }

  readUInt8() {
    const r = this.buffer.readUInt8(this._start)
    this._start += 1
    return r
  }

  writeUInt8(value: number) {
    const r = this.buffer.writeUInt8(value, this._start)
    this._start += 1
    return r
  }

  readUInt16BE() {
    const r = this.buffer.readUInt16BE(this._start)
    this._start += 2
    return r
  }

  writeUInt16BE(value: number) {
    const r = this.buffer.writeUInt16BE(value, this._start)
    this._start += 2
    return r
  }

  readUInt32BE() {
    const r = this.buffer.readUInt32BE(this._start)
    this._start += 4
    return r
  }

  writeUInt32BE(value: number) {
    const r = this.buffer.writeUInt32BE(value, this._start)
    this._start += 4
    return r
  }
}
