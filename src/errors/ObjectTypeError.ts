import { BaseError } from './BaseError'

export type ObjectType = 'blob' | 'commit' | 'tag' | 'tree'

export type ObjectTypeErrorData = {
  oid: string
  actual: string
  expected: ObjectType
  filepath?: string
}

export class ObjectTypeError extends BaseError<ObjectTypeErrorData> {
  public static readonly code = 'ObjectTypeError'

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
