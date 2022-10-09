import { BaseError } from './BaseError'

export type InvalidFilepathReason = 'leading-slash' | 'trailing-slash'

export type InvalidFilepathErrorData = {
  reason: InvalidFilepathReason
}

/**
 * @group Errors
 */
export class InvalidFilepathError extends BaseError<InvalidFilepathErrorData> {
  public static readonly code = 'InvalidFilepathError'

  constructor(reason: InvalidFilepathReason) {
    let message = 'invalid filepath'
    if (reason === 'leading-slash' || reason === 'trailing-slash') {
      message = `"filepath" parameter should not include leading or trailing directory separators because these can cause problems on some platforms.`
    }
    super(message, InvalidFilepathError.code, { reason })
  }
}

