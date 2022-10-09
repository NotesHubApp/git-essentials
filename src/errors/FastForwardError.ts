import { BaseError } from './BaseError'

/**
 * @group Errors
 */
export class FastForwardError extends BaseError<void> {
  public static readonly code = 'FastForwardError'

  constructor() {
    super(`A simple fast-forward merge was not possible.`, FastForwardError.code, undefined)
  }
}
