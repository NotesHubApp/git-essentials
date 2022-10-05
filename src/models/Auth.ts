import { HttpHeaders } from './HttpClient'


export type Auth = {
  username?: string
  password?: string
  headers?: HttpHeaders
  /** Tells git to throw a `UserCanceledError` (instead of an `HttpError`). */
  cancel?: boolean
}

/**
 * @group Callbacks
 */
export type AuthCallback = (url: string, auth: Auth) => Auth | void | Promise<Auth | void>

/**
 * @group Callbacks
 */
export type AuthFailureCallback = (url: string, auth: Auth) => Auth | void | Promise<Auth | void>

/**
 * @group Callbacks
 */
export type AuthSuccessCallback = (url: string, auth: Auth) => void | Promise<void>
