import { BaseError } from './BaseError'

type CheckoutConflictErrorData = {
  filepaths: string[]
}

export class CheckoutConflictError extends BaseError<CheckoutConflictErrorData> {
  public static readonly code = 'CheckoutConflictError'

  /**
   * @param {string[]} filepaths
   */
  constructor(filepaths: string[]) {
    super(
      `Your local changes to the following files would be overwritten by checkout: ${filepaths.join(
        ', '
      )}`,
      CheckoutConflictError.code,
      { filepaths }
    )
  }
}

