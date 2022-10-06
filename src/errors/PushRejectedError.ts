import { BaseError } from './BaseError'

export type PushRejectionReason = 'not-fast-forward' | 'tag-exists'

export type PushRejectedErrorData = {
  reason: PushRejectionReason
}

export class PushRejectedError extends BaseError<PushRejectedErrorData> {
  public static readonly code = 'PushRejectedError'

  constructor(reason: PushRejectionReason) {
    let message = ''
    if (reason === 'not-fast-forward') {
      message = ' because it was not a simple fast-forward'
    } else if (reason === 'tag-exists') {
      message = ' because tag already exists'
    }
    super(`Push rejected${message}. Use "force: true" to override.`, PushRejectedError.code, { reason })
  }
}

