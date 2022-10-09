import { BaseError } from './BaseError'

export type InvalidOidErrorData = {
  value: string
}

/**
 * @group Errors
 */
export class InvalidOidError extends BaseError<InvalidOidErrorData> {
  public static readonly code = 'InvalidOidError'

  constructor(value: string) {
    super(
      `Expected a 40-char hex object id but saw "${value}".`,
      InvalidOidError.code,
      { value })
  }
}
