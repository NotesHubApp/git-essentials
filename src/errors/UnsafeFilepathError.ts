import { BaseError } from './BaseError'

export type UnsafeFilepathErrorData = {
  filepath: string
}

/**
 * @group Errors
 */
export class UnsafeFilepathError extends BaseError<UnsafeFilepathErrorData> {
  public static readonly code = 'UnsafeFilepathError'

  constructor(filepath: string) {
    super(`The filepath "${filepath}" contains unsafe character sequences`, UnsafeFilepathError.code, { filepath })
  }
}
