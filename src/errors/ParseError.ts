import { BaseError } from './BaseError'

export type ParseErrorData = {
  expected: string
  actual: string
}

export class ParseError extends BaseError<ParseErrorData> {
  public static readonly code = 'ParseError'

  constructor(expected: string, actual: string) {
    super(`Expected "${expected}" but received "${actual}".`, ParseError.code, { expected, actual })
  }
}

