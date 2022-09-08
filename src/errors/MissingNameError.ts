import { BaseError } from './BaseError'

type Role = 'author' | 'committer' | 'tagger'

type MissingNameErrorData = {
  role: Role
}

export class MissingNameError extends BaseError<MissingNameErrorData> {
  public static readonly code = 'MissingNameError'

  /**
   * @param {'author'|'committer'|'tagger'} role
   */
  constructor(role: Role) {
    super(
      `No name was provided for ${role} in the argument or in the .git/config file.`,
      MissingNameError.code,
      { role }
    )
  }
}

