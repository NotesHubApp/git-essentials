import { BaseError } from './BaseError.js'

export class AlreadyExistsError extends BaseError {
  public static readonly code = 'AlreadyExistsError'

  /**
   * @param {'note'|'remote'|'tag'|'branch'} noun
   * @param {string} where
   * @param {boolean} canForce
   */
  constructor(noun: string, where: string, canForce: boolean = true) {
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
