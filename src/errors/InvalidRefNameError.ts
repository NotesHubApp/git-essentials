import { BaseError } from './BaseError.js'

export class InvalidRefNameError extends BaseError {
  public static readonly code = 'InvalidRefNameError'

  /**
   * @param {string} ref
   * @param {string} suggestion
   */
  constructor(ref: string, suggestion: string) {
    super(
      `"${ref}" would be an invalid git reference. (Hint: a valid alternative would be "${suggestion}".)`,
      InvalidRefNameError.code,
      { ref, suggestion }
    )
  }
}

