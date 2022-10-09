import { BaseError } from './BaseError'

export type UrlParseErrorData = {
  url: string
}

export class UrlParseError extends BaseError<UrlParseErrorData> {
  public static readonly code = 'UrlParseError'

  constructor(url: string) {
    super(`Cannot parse remote URL: "${url}"`, UrlParseError.code, { url })
  }
}
