import { BaseError } from './BaseError'

export type MissingNameRole = 'author' | 'committer' | 'tagger'

export type MissingNameErrorData = {
  role: MissingNameRole
}

/**
 * @group Errors
 */
export class MissingNameError extends BaseError<MissingNameErrorData> {
  public static readonly code = 'MissingNameError'

  constructor(role: MissingNameRole) {
    super(
      `No name was provided for ${role} in the argument or in the .git/config file.`,
      MissingNameError.code,
      { role }
    )
  }
}

