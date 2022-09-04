import { MissingParameterError } from '../errors/MissingParameterError'

export function assertParameter<T>(name: string, value: T) {
  if (value === undefined) {
    throw new MissingParameterError(name)
  }
}
