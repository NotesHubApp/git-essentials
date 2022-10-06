import { BaseError } from './BaseError'

export type Role = 'author' | 'committer' | 'tagger'

export type MissingNameErrorData = {
  role: Role
}

export class MissingNameError extends BaseError<MissingNameErrorData> {
  public static readonly code = 'MissingNameError'

  constructor(role: Role) {
    super(
      `No name was provided for ${role} in the argument or in the .git/config file.`,
      MissingNameError.code,
      { role }
    )
  }
}

