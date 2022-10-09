import { BaseError } from './BaseError'

export type InvalidRefNameErrorData = {
  ref: string
  suggestion: string
}

/**
 * @group Errors
 */
export class InvalidRefNameError extends BaseError<InvalidRefNameErrorData> {
  public static readonly code = 'InvalidRefNameError'

  constructor(ref: string, suggestion: string) {
    super(
      `"${ref}" would be an invalid git reference. (Hint: a valid alternative would be "${suggestion}".)`,
      InvalidRefNameError.code,
      { ref, suggestion }
    )
  }
}

