import { BaseError } from './BaseError'

export class MissingParameterError extends BaseError {
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


