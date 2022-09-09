type Result<T> = {
  value?: T
  done?: boolean
}

export class FIFO<T> {
  private readonly _queue: T[]
  private _ended: boolean
  private _waiting?: ((value: Result<T> | PromiseLike<Result<T>>) => void) | null
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
      resolve({ done: true })
    }
  }

  destroy(err: Error) {
    this._ended = true
    this.error = err
  }

  async next() {
    if (this._queue.length > 0) {
      return { value: this._queue.shift() }
    }

    if (this._ended) {
      return { done: true }
    }

    if (this._waiting) {
      throw Error(
        'You cannot call read until the previous call to read has returned!'
      )
    }

    return new Promise<Result<T>>(resolve => {
      this._waiting = resolve
    })
  }
}
