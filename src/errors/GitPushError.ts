import { PushResult } from '..'
import { BaseError } from './BaseError'


export type GitPushErrorData = {
  prettyDetails: string
  result: PushResult
}

export class GitPushError extends BaseError<GitPushErrorData> {
  public static readonly code = 'GitPushError'

  constructor(prettyDetails: string, result: PushResult) {
    super(
      `One or more branches were not updated: ${prettyDetails}`,
      GitPushError.code,
      { prettyDetails, result }
    )
  }
}

