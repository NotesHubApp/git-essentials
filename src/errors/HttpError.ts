import { BaseError } from './BaseError'
import { HttpHeaders } from '..'

export type HttpErrorData = {
  statusCode: number
  statusMessage: string
  url: string
  method?: string
  response?: string
  headers?: HttpHeaders
}

export class HttpError extends BaseError<HttpErrorData> {
  public static readonly code = 'HttpError'

  constructor(
    statusCode: number,
    statusMessage: string,
    url: string,
    method?: string,
    response?: string,
    headers?: HttpHeaders) {
    super(
      `HTTP Error: ${statusCode} ${statusMessage}`,
      HttpError.code,
      { statusCode, statusMessage, url, method, response, headers })
  }
}

