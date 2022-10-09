import { BaseError } from './BaseError'

export type AlreadyExistsEntity = 'note' | 'remote' | 'tag' | 'branch'

export type AlreadyExistsErrorData = {
  noun: AlreadyExistsEntity
  where: string
  canForce: boolean
}

/**
 * @group Errors
 */
export class AlreadyExistsError extends BaseError<AlreadyExistsErrorData> {
  public static readonly code = 'AlreadyExistsError'

  constructor(noun: AlreadyExistsEntity, where: string, canForce: boolean = true) {
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
