import { BaseError } from './BaseError'

type MissingParameterErrorData = {
  parameter: string
}

export class MissingParameterError extends BaseError<MissingParameterErrorData> {
  static readonly code = 'MissingParameterError'

  /**
   * @param {string} parameter
   */
  constructor(parameter: string) {
    super(
      `The function requires a "${parameter}" parameter but none was provided.`,
      MissingParameterError.code,
      { parameter }
    )
  }
}


