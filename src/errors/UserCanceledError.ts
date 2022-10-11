import { BaseError } from './BaseError'

export class UserCanceledError extends BaseError<void> {
  public static readonly code = 'UserCanceledError'

  constructor() {
    super(`The operation was canceled.`, UserCanceledError.code, undefined)
  }
}
