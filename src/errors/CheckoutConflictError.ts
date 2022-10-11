import { BaseError } from './BaseError'

export type CheckoutConflictErrorData = {
  filepaths: string[]
}

export class CheckoutConflictError extends BaseError<CheckoutConflictErrorData> {
  public static readonly code = 'CheckoutConflictError'

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

