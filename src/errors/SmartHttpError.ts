import { BaseError } from './BaseError'

type SmartHttpErrorData = {
  preview?: string
  response?: string
}

export class SmartHttpError extends BaseError<SmartHttpErrorData> {
  public static readonly code = 'SmartHttpError'

  /**
   * @param {string} preview
   * @param {string} response
   */
  constructor(preview?: string, response?: string) {
    super(
      `Remote did not reply using the "smart" HTTP protocol. Expected "001e# service=git-upload-pack" but received: ${preview}`,
      SmartHttpError.code,
      { preview, response }
    )
  }
}

