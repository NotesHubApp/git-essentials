import { BaseError } from './BaseError'

export class InvalidOidError extends BaseError {
  public static readonly code = 'InvalidOidError'

  /**
   * @param {string} value
   */
  constructor(value: string) {
    super(
      `Expected a 40-char hex object id but saw "${value}".`,
      InvalidOidError.code,
      { value })
  }
}
