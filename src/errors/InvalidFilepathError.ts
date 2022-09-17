import { BaseError } from './BaseError'

type Reason = 'leading-slash' | 'trailing-slash'

type InvalidFilepathErrorData = {
  reason: Reason
}

export class InvalidFilepathError extends BaseError<InvalidFilepathErrorData> {
  public static readonly code = 'InvalidFilepathError'

  /**
   * @param {'leading-slash' | 'trailing-slash'} [reason]
   */
  constructor(reason: Reason) {
    let message = 'invalid filepath'
    if (reason === 'leading-slash' || reason === 'trailing-slash') {
      message = `"filepath" parameter should not include leading or trailing directory separators because these can cause problems on some platforms.`
    }
    super(message, InvalidFilepathError.code, { reason })
  }
}

