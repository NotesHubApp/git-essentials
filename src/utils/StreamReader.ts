import { Buffer } from 'buffer'

import { getIterator } from './getIterator'

/**
 * Inspired by 'gartal' but lighter-weight and more battle-tested.
 * @internal
 */
export class StreamReader {
  private stream: Iterator<Uint8Array, undefined> | AsyncIterator<Uint8Array, undefined>
  private buffer: Buffer | null
  private cursor: number
  private undoCursor: number
  private started: boolean
  private _ended: boolean
  private _discardedBytes: number

  public get ended() { return this._ended }

  constructor(stream: Uint8Array[] | AsyncIterableIterator<Uint8Array>) {
    this.stream = getIterator(stream)
    this.buffer = null
    this.cursor = 0
    this.undoCursor = 0
    this.started = false
    this._ended = false
    this._discardedBytes = 0
  }

  eof() {
    return this._ended && this.cursor === this.buffer!.length
  }

  tell() {
    return this._discardedBytes + this.cursor
  }

  async byte() {
    if (this.eof()) return
    if (!this.started) await this._init()
    if (this.cursor === this.buffer!.length) {
      await this._loadnext()
      if (this._ended) return
    }
    this._moveCursor(1)
    return this.buffer![this.undoCursor]
  }

  async chunk() {
    if (this.eof()) return
    if (!this.started) await this._init()
    if (this.cursor === this.buffer!.length) {
      await this._loadnext()
      if (this._ended) return
    }
    this._moveCursor(this.buffer!.length)
    return this.buffer!.slice(this.undoCursor, this.cursor)
  }

  async read(n: number) {
    if (this.eof()) return
    if (!this.started) await this._init()
    if (this.cursor + n > this.buffer!.length) {
      this._trim()
      await this._accumulate(n)
    }
    this._moveCursor(n)
    return this.buffer!.slice(this.undoCursor, this.cursor)
  }

  async skip(n: number) {
    if (this.eof()) return
    if (!this.started) await this._init()
    if (this.cursor + n > this.buffer!.length) {
      this._trim()
      await this._accumulate(n)
    }
    this._moveCursor(n)
  }

  async undo() {
    this.cursor = this.undoCursor
  }

  private async _next(): Promise<Buffer | null> {
    this.started = true
    let { done, value } = await this.stream.next()

    if (done) {
      this._ended = true
    }

    if (value) {
      return Buffer.from(value)
    }

    return null
  }

  private _trim() {
    // Throw away parts of the buffer we don't need anymore
    // assert(this.cursor <= this.buffer.length)
    this.buffer = this.buffer!.slice(this.undoCursor)
    this.cursor -= this.undoCursor
    this._discardedBytes += this.undoCursor
    this.undoCursor = 0
  }

  private _moveCursor(n: number) {
    this.undoCursor = this.cursor
    this.cursor += n
    if (this.cursor > this.buffer!.length) {
      this.cursor = this.buffer!.length
    }
  }

  private async _accumulate(n: number) {
    if (this._ended) return
    // Expand the buffer until we have N bytes of data
    // or we've reached the end of the stream
    const buffers = [this.buffer!]
    while (this.cursor + n > lengthBuffers(buffers)) {
      const nextbuffer = await this._next()
      if (this._ended) break
      buffers.push(nextbuffer!)
    }
    this.buffer = Buffer.concat(buffers)
  }

  private async _loadnext() {
    this._discardedBytes += this.buffer!.length
    this.undoCursor = 0
    this.cursor = 0
    this.buffer = await this._next()
  }

  private async _init() {
    this.buffer = await this._next()
  }
}

// This helper function helps us postpone concatenating buffers, which
// would create intermediate buffer objects,
function lengthBuffers(buffers: Uint8Array[]) {
  return buffers.reduce((acc, buffer) => acc + buffer.length, 0)
}
