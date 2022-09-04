import { BaseError } from './BaseError'

export class InternalError extends BaseError {
  public static readonly code = 'InternalError'

  /**
   * @param {string} message
   */
  constructor(message: string) {
    super(
      `An internal error caused this command to fail. Please file a bug report at https://github.com/isomorphic-git/isomorphic-git/issues with this error message: ${message}`,
      InternalError.code,
      { message }
    )
  }
}

