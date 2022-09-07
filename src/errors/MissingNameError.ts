import { BaseError } from './BaseError'

export class MissingNameError extends BaseError {
  public static readonly code = 'MissingNameError'

  /**
   * @param {'author'|'committer'|'tagger'} role
   */
  constructor(role: 'author' | 'committer' | 'tagger') {
    super(
      `No name was provided for ${role} in the argument or in the .git/config file.`,
      MissingNameError.code,
      { role }
    )
  }
}

