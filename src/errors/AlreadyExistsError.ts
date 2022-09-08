import { BaseError } from './BaseError'

type Noun = 'note' | 'remote' | 'tag' | 'branch'

type AlreadyExistsErrorData = {
  noun: Noun
  where: string
  canForce: boolean
}

export class AlreadyExistsError extends BaseError<AlreadyExistsErrorData> {
  public static readonly code = 'AlreadyExistsError'

  /**
   * @param {'note'|'remote'|'tag'|'branch'} noun
   * @param {string} where
   * @param {boolean} canForce
   */
  constructor(noun: Noun, where: string, canForce: boolean = true) {
    super(
      `Failed to create ${noun} at ${where} because it already exists.${
        canForce
          ? ` (Hint: use 'force: true' parameter to overwrite existing ${noun}.)`
          : ''
      }`,
      AlreadyExistsError.code,
      { noun, where, canForce }
    )
  }
}
