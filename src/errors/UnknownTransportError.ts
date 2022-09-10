import { BaseError } from './BaseError'

type UnknownTransportErrorData = {
  url: string
  transport: string
  suggestion?: string
}

export class UnknownTransportError extends BaseError<UnknownTransportErrorData> {
  public static readonly code = 'UnknownTransportError'

  /**
   * @param {string} url
   * @param {string} transport
   * @param {string} suggestion
   */
  constructor(url: string, transport: string, suggestion?: string) {
    super(
      `Git remote "${url}" uses an unrecognized transport protocol: "${transport}"`,
      UnknownTransportError.code,
      { url, transport, suggestion }
    )
  }
}

