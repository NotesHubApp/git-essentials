import { BaseError } from './BaseError'

export class NotFoundError extends BaseError {
  static readonly code = 'NotFoundError'

  /**
   * @param {string} what
   */
  constructor(what: string) {
    super(`Could not find ${what}.`, NotFoundError.code, { what })
  }
}

