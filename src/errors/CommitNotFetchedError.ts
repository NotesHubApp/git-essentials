import { BaseError } from './BaseError'

type CommitNotFetchedErrorData = {
  ref: string
  oid: string
}

export class CommitNotFetchedError extends BaseError<CommitNotFetchedErrorData> {
  public static readonly code = 'CommitNotFetchedError'

  /**
   * @param {string} ref
   * @param {string} oid
   */
  constructor(ref: string, oid: string) {
    super(
      `Failed to checkout "${ref}" because commit ${oid} is not available locally. Do a git fetch to make the branch available locally.`,
      CommitNotFetchedError.code,
      { ref, oid }
    )
  }
}

