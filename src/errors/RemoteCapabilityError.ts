import { BaseError } from './BaseError'

export type RemoteCapability = 'shallow' | 'deepen-since' | 'deepen-not' | 'deepen-relative'
export type RemoteParameter = 'depth' | 'since' | 'exclude' | 'relative'

export type RemoteCapabilityErrorData = {
  capability: RemoteCapability
  parameter: RemoteParameter
}

/**
 * @group Errors
 */
export class RemoteCapabilityError extends BaseError<RemoteCapabilityErrorData> {
  public static readonly code = 'RemoteCapabilityError'

  constructor(capability: RemoteCapability, parameter: RemoteParameter) {
    super(
      `Remote does not support the "${capability}" so the "${parameter}" parameter cannot be used.`,
      RemoteCapabilityError.code,
      { capability, parameter }
    )
  }
}

