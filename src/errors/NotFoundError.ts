import { BaseError } from './BaseError'

export class NotFoundError extends BaseError {
  static readonly code = 'NotFoundError'

  /**
   * @param {string} what
   */
  constructor(what: string) {
    super(`Could not find ${what}.`)
    this.code = this.name = NotFoundError.code
    this.data = { what }
  }
}

