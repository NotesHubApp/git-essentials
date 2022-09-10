import { BaseError } from './BaseError'

type Capability = 'shallow' | 'deepen-since' | 'deepen-not' | 'deepen-relative'
type Parameter = 'depth' | 'since' | 'exclude' | 'relative'

type RemoteCapabilityErrorData = {
  capability: Capability
  parameter: Parameter
}

export class RemoteCapabilityError extends BaseError<RemoteCapabilityErrorData> {
  public static readonly code = 'RemoteCapabilityError'

  /**
   * @param {'shallow'|'deepen-since'|'deepen-not'|'deepen-relative'} capability
   * @param {'depth'|'since'|'exclude'|'relative'} parameter
   */
  constructor(capability: Capability, parameter: Parameter) {
    super(
      `Remote does not support the "${capability}" so the "${parameter}" parameter cannot be used.`,
      RemoteCapabilityError.code,
      { capability, parameter }
    )
  }
}

