import { BaseError } from './BaseError'

type InvalidOidErrorData = {
  value: string
}

export class InvalidOidError extends BaseError<InvalidOidErrorData> {
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
