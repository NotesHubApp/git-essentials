type IteratorResolve<T> = ((value: IteratorResult<T, undefined> | PromiseLike<IteratorResult<T, undefined>>) => void)

export class FIFO<T> implements AsyncIterator<T, undefined> {
  private readonly _queue: T[]
  private _ended: boolean
  private _waiting?: IteratorResolve<T> | null
  private error?: Error

  constructor() {
    this._queue = []
    this._ended = false
    this._waiting = null
  }

  write(chunk: T) {
    if (this._ended) {
      throw Error('You cannot write to a FIFO that has already been ended!')
    }

    if (this._waiting) {
      const resolve = this._waiting
      this._waiting = null
      resolve({ value: chunk })
    } else {
      this._queue.push(chunk)
    }
  }

  end() {
    this._ended = true
    if (this._waiting) {
      const resolve = this._waiting
      this._waiting = null
      resolve({ done: true, value: undefined })
    }
  }

  destroy(err: Error) {
    this._ended = true
    this.error = err
  }

  async next(): Promise<IteratorResult<T, undefined>> {
    if (this._queue.length > 0) {
      return { done: false, value: this._queue.shift()! }
    }

    if (this._ended) {
      return { done: true, value: undefined }
    }

    if (this._waiting) {
      throw Error(
        'You cannot call read until the previous call to read has returned!'
      )
    }

    return new Promise<IteratorResult<T, undefined>>(resolve => {
      this._waiting = resolve
    })
  }
}
