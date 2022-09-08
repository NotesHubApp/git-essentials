import { BaseError } from './BaseError'

type NotFoundErrorData = {
  what: string
}

export class NotFoundError extends BaseError<NotFoundErrorData> {
  static readonly code = 'NotFoundError'

  /**
   * @param {string} what
   */
  constructor(what: string) {
    super(`Could not find ${what}.`, NotFoundError.code, { what })
  }
}

