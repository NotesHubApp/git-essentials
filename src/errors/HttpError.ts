import { BaseError } from './BaseError'

type HttpErrorData = {
  statusCode: number
  statusMessage: string
  response: string
}

export class HttpError extends BaseError<HttpErrorData> {
  public static readonly code = 'HttpError'

  /**
   * @param {number} statusCode
   * @param {string} statusMessage
   * @param {string} response
   */
  constructor(statusCode: number, statusMessage: string, response: string) {
    super(
      `HTTP Error: ${statusCode} ${statusMessage}`,
      HttpError.code,
      { statusCode, statusMessage, response })
  }
}

