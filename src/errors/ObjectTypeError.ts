import { BaseError } from './BaseError'

type ObjectType = 'blob' | 'commit' | 'tag' | 'tree'

type ObjectTypeErrorData = {
  oid: string
  actual: string
  expected: ObjectType
  filepath?: string
}

export class ObjectTypeError extends BaseError<ObjectTypeErrorData> {
  public static readonly code = 'ObjectTypeError'

  /**
   * @param {string} oid
   * @param {'blob'|'commit'|'tag'|'tree'} actual
   * @param {'blob'|'commit'|'tag'|'tree'} expected
   * @param {string} [filepath]
   */
  constructor(oid: string, actual: string, expected: ObjectType, filepath?: string) {
    super(
      `Object ${oid} ${
        filepath ? `at ${filepath}` : ''
      }was anticipated to be a ${expected} but it is a ${actual}.`,
      ObjectTypeError.code,
      { oid, actual, expected, filepath }
    )
  }
}
