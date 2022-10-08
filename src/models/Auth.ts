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
 * The callback is called when credentials fail.
 * This is helpful to know if you were using a saved password in the {@link AuthCallback},
 * then you may want to offer the user the option to delete the currently saved password.
 * It also gives you an opportunity to retry the request with new credentials.
 *
 * As long as the callback function returns credentials, it will keep trying.
 * This is the main reason we don't re-use the {@link AuthCallback} for this purpose.
 * If we did, then a naive {@link AuthCallback} that simply returned saved credentials might loop indefinitely.
 *
 * @example
 * ```typescript
 * await clone({
 *   ...,
 *   onAuthFailure: (url, auth) => {
 *     forgetSavedPassword(url)
 *     if (confirm('Access was denied. Try again?')) {
 *       auth = {
 *         username: prompt('Enter username'),
 *         password: prompt('Enter password'),
 *       }
 *       return auth
 *     } else {
 *       return { cancel: true }
 *     }
 *   }
 * })
 * ```
 *
 * @group Callbacks
 */
export type AuthFailureCallback = (url: string, auth: Auth) => Auth | void | Promise<Auth | void>

/**
 * The callback is called when credentials work.
 * This is helpful to know if you want to offer to save the credentials, but only if they are valid.
 *
 * @example
 * ```typescript
 * await clone({
 *   ...,
 *   onAuthSuccess: (url, auth) => {
 *     if (confirm('Remember password?')) {
 *       savePassword(url, auth)
 *     }
 *   }
 * })
 * ```
 *
 * @group Callbacks
 */
export type AuthSuccessCallback = (url: string, auth: Auth) => void | Promise<void>
