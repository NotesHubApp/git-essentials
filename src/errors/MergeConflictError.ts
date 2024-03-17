import { BaseError } from './BaseError'

export type MergeConflictErrorData = {
  filePath: string
}

export class MergeConflictError extends BaseError<MergeConflictErrorData> {
  public static readonly code = 'MergeConflictError'

  constructor(filePath: string) {
    super(
      `Automatic merge failed with a conflict in the following path: ${filePath}.`,
      MergeConflictError.code,
      { filePath }
    )
  }
}

