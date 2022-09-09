import { BaseError } from './BaseError'

type UrlParseErrorData = {
  url: string
}

export class UrlParseError extends BaseError<UrlParseErrorData> {
  public static readonly code = 'UrlParseError'

  /**
   * @param {string} url
   */
  constructor(url: string) {
    super(`Cannot parse remote URL: "${url}"`, UrlParseError.code, { url })
  }
}
