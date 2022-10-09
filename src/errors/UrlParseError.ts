import { BaseError } from './BaseError'

export type UrlParseErrorData = {
  url: string
}

/**
 * @group Errors
 */
export class UrlParseError extends BaseError<UrlParseErrorData> {
  public static readonly code = 'UrlParseError'

  constructor(url: string) {
    super(`Cannot parse remote URL: "${url}"`, UrlParseError.code, { url })
  }
}
