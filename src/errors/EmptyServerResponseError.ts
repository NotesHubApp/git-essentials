import { BaseError } from './BaseError'

export class EmptyServerResponseError extends BaseError<void> {
  public static readonly code = 'EmptyServerResponseError'

  constructor() {
    super(`Empty response from git server.`, EmptyServerResponseError.code, undefined)
  }
}
