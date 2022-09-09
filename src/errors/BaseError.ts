type ErrorDto<T> = {
  message: string
  code: string
  data: T
  caller: string
  stack?: string
}

export class BaseError<T> extends Error {
  caller: string

  constructor(message: string, public readonly code: string, public readonly data: T) {
    super(message)
    // Setting this here allows TS to infer that all git errors have a `caller` property and
    // that its type is string.
    this.name = code
    this.caller = ''
  }

  toJSON(): ErrorDto<T> {
    // Error objects aren't normally serializable. So we do something about that.
    return {
      code: this.code,
      data: this.data,
      caller: this.caller,
      message: this.message,
      stack: this.stack,
    }
  }

  fromJSON(json: ErrorDto<T>) {
    const e = new BaseError(json.message, json.code, json.data)
    e.caller = json.caller
    e.stack = json.stack
    return e
  }
}
