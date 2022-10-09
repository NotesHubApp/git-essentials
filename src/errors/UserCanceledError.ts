import { BaseError } from './BaseError'

/**
 * @group Errors
 */
export class UserCanceledError extends BaseError<void> {
  public static readonly code = 'UserCanceledError'

  constructor() {
    super(`The operation was canceled.`, UserCanceledError.code, undefined)
  }
}
