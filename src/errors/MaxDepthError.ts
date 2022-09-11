import { BaseError } from './BaseError'

type MaxDepthErrorData = {
  depth: number
}

export class MaxDepthError extends BaseError<MaxDepthErrorData> {
  public static readonly code = 'MaxDepthError'

  /**
   * @param {number} depth
   */
  constructor(depth: number) {
    super(`Maximum search depth of ${depth} exceeded.`, MaxDepthError.code, { depth })
  }
}

