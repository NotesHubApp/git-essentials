import { BaseError } from './BaseError'

export type SmartHttpErrorData = {
  preview?: string
  response?: string
}

/**
 * @group Errors
 */
export class SmartHttpError extends BaseError<SmartHttpErrorData> {
  public static readonly code = 'SmartHttpError'

  constructor(preview?: string, response?: string) {
    super(
      `Remote did not reply using the "smart" HTTP protocol. Expected "001e# service=git-upload-pack" but received: ${preview}`,
      SmartHttpError.code,
      { preview, response }
    )
  }
}

