import { BaseError } from './BaseError'

export type InternalErrorData = {
  message: string
}

/**
 * @group Errors
 */
export class InternalError extends BaseError<InternalErrorData> {
  public static readonly code = 'InternalError'

  constructor(message: string) {
    super(
      `An internal error caused this command to fail. Error message: ${message}`,
      InternalError.code,
      { message }
    )
  }
}

