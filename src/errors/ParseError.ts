import { BaseError } from './BaseError'

type ParseErrorData = {
  expected: string
  actual: string
}

export class ParseError extends BaseError<ParseErrorData> {
  public static readonly code = 'ParseError'

  /**
   * @param {string} expected
   * @param {string} actual
   */
  constructor(expected: string, actual: string) {
    super(`Expected "${expected}" but received "${actual}".`, ParseError.code, { expected, actual })
  }
}

