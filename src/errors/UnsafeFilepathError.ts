import { BaseError } from './BaseError'

type UnsafeFilepathErrorData = {
  filepath: string
}

 export class UnsafeFilepathError extends BaseError<UnsafeFilepathErrorData> {
  public static readonly code = 'UnsafeFilepathError'

   /**
    * @param {string} filepath
    */
   constructor(filepath: string) {
     super(`The filepath "${filepath}" contains unsafe character sequences`, UnsafeFilepathError.code, { filepath })
   }
 }
