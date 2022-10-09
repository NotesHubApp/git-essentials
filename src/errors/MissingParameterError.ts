import { BaseError } from './BaseError'

export type MissingParameterErrorData = {
  parameter: string
}

/**
 * @group Errors
 */
export class MissingParameterError extends BaseError<MissingParameterErrorData> {
  static readonly code = 'MissingParameterError'

  constructor(parameter: string) {
    super(
      `The function requires a "${parameter}" parameter but none was provided.`,
      MissingParameterError.code,
      { parameter }
    )
  }
}


