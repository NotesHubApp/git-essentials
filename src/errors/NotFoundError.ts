import { BaseError } from './BaseError'

export type NotFoundErrorData = {
  what: string
}

export class NotFoundError extends BaseError<NotFoundErrorData> {
  static readonly code = 'NotFoundError'

  constructor(what: string) {
    super(`Could not find ${what}.`, NotFoundError.code, { what })
  }
}

