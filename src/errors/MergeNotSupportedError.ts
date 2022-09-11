import { BaseError } from './BaseError'


export class MergeNotSupportedError extends BaseError<void> {
  public static readonly code = 'MergeNotSupportedError'

  constructor(message: string = `Merges with conflicts are not supported yet.`) {
    super(message, MergeNotSupportedError.code, undefined)
  }
}

