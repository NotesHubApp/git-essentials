import { BaseError } from './BaseError'

type Reason = 'not-fast-forward' | 'tag-exists'

type PushRejectedErrorData = {
  reason: Reason
}

export class PushRejectedError extends BaseError<PushRejectedErrorData> {
  public static readonly code = 'PushRejectedError'

  /**
   * @param {'not-fast-forward'|'tag-exists'} reason
   */
  constructor(reason: Reason) {
    let message = ''
    if (reason === 'not-fast-forward') {
      message = ' because it was not a simple fast-forward'
    } else if (reason === 'tag-exists') {
      message = ' because tag already exists'
    }
    super(`Push rejected${message}. Use "force: true" to override.`, PushRejectedError.code, { reason })
  }
}

