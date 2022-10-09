import { BaseError } from './BaseError'

export type MaxDepthErrorData = {
  depth: number
}

/**
 * @group Errors
 */
export class MaxDepthError extends BaseError<MaxDepthErrorData> {
  public static readonly code = 'MaxDepthError'

  constructor(depth: number) {
    super(`Maximum search depth of ${depth} exceeded.`, MaxDepthError.code, { depth })
  }
}

