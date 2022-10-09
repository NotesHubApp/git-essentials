import { BaseError } from './BaseError'

export type HttpErrorData = {
  statusCode: number
  statusMessage: string
  response?: string
}

/**
 * @group Errors
 */
export class HttpError extends BaseError<HttpErrorData> {
  public static readonly code = 'HttpError'

  constructor(statusCode: number, statusMessage: string, response?: string) {
    super(
      `HTTP Error: ${statusCode} ${statusMessage}`,
      HttpError.code,
      { statusCode, statusMessage, response })
  }
}

