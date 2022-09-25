import { BaseError } from './BaseError'

type InternalErrorData = {
  message: string
}

export class InternalError extends BaseError<InternalErrorData> {
  public static readonly code = 'InternalError'

  /**
   * @param {string} message
   */
  constructor(message: string) {
    super(
      `An internal error caused this command to fail. Error message: ${message}`,
      InternalError.code,
      { message }
    )
  }
}

