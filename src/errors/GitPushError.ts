import { HttpHeaders } from '../models'
import { BaseError } from './BaseError'

type PushResult = {
  ok: boolean
  error?: string
  refs: { [key: string]: { ok: boolean, error?: string } }
  headers?: HttpHeaders
}

type GitPushErrorData = {
  prettyDetails: string
  result: PushResult
}

export class GitPushError extends BaseError<GitPushErrorData> {
  public static readonly code = 'GitPushError'

  /**
   * @param {string} prettyDetails
   * @param {PushResult} result
   */
  constructor(prettyDetails: string, result: PushResult) {
    super(
      `One or more branches were not updated: ${prettyDetails}`,
      GitPushError.code,
      { prettyDetails, result }
    )
  }
}

