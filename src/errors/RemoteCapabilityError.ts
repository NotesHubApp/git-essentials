import { BaseError } from './BaseError'

export type Capability = 'shallow' | 'deepen-since' | 'deepen-not' | 'deepen-relative'
export type Parameter = 'depth' | 'since' | 'exclude' | 'relative'

export type RemoteCapabilityErrorData = {
  capability: Capability
  parameter: Parameter
}

export class RemoteCapabilityError extends BaseError<RemoteCapabilityErrorData> {
  public static readonly code = 'RemoteCapabilityError'

  constructor(capability: Capability, parameter: Parameter) {
    super(
      `Remote does not support the "${capability}" so the "${parameter}" parameter cannot be used.`,
      RemoteCapabilityError.code,
      { capability, parameter }
    )
  }
}

