import { BaseError } from './BaseError'

export type UnknownTransportErrorData = {
  url: string
  transport: string
  suggestion?: string
}

/**
 * @group Errors
 */
export class UnknownTransportError extends BaseError<UnknownTransportErrorData> {
  public static readonly code = 'UnknownTransportError'

  constructor(url: string, transport: string, suggestion?: string) {
    super(
      `Git remote "${url}" uses an unrecognized transport protocol: "${transport}"`,
      UnknownTransportError.code,
      { url, transport, suggestion }
    )
  }
}

