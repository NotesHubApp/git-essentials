import { BaseError } from './BaseError'

export type CommitNotFetchedErrorData = {
  ref: string
  oid: string
}

export class CommitNotFetchedError extends BaseError<CommitNotFetchedErrorData> {
  public static readonly code = 'CommitNotFetchedError'

  constructor(ref: string, oid: string) {
    super(
      `Failed to checkout "${ref}" because commit ${oid} is not available locally. Do a git fetch to make the branch available locally.`,
      CommitNotFetchedError.code,
      { ref, oid }
    )
  }
}

