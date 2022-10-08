import { HttpHeaders } from './HttpClient'


export type Auth = {
  username?: string
  password?: string
  headers?: HttpHeaders
  /** Tells git to throw a `UserCanceledError` (instead of an `HttpError`). */
  cancel?: boolean
}

/**
 * The callback allows to request credentials.
 *
 * Authentication is normally required for pushing to a git repository.
 * It may also be required to clone or fetch from a private repository.
 * Git does all its authentication using HTTPS Basic Authentication.
 *
 * @example
 * ```typescript
 * await clone({
 *   ...,
 *   onAuth: url => {
 *     let auth = lookupSavedPassword(url)
 *     if (auth) return auth
 *     if (confirm('This repo is password protected. Ready to enter a username & password?')) {
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
 * ### Option 1: Username & Password
 *
 * Return an object with `{ username, password }`.
 *
 * However, there are some things to watch out for.
 *
 * If you have two-factor authentication (2FA) enabled on your account, you
 * probably cannot push or pull using your regular username and password.
 * Instead, you may have to use a Personal Access Token.
 *
 * #### Personal Access Tokens
 *
 * - [Instructions for GitHub](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
 * - [Instructions for Bitbucket](https://confluence.atlassian.com/bitbucket/app-passwords-828781300.html)
 * - [Instructions for GitLab](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)
 *
 * In this situation, you want to return an object with `{ username, password }`
 * where `password` is the Personal Access Token.
 * Note that GitHub actually lets you specify the token as the `username` and leave the password blank,
 * which is convenient but none of the other hosting providers do this that I'm aware of.
 *
 * #### OAuth2 Tokens
 *
 * If you are writing a third-party app that interacts with GitHub/GitLab/Bitbucket, you may be obtaining
 * OAuth2 tokens from the service via a feature like "Login with GitHub".
 * Depending on the OAuth2 token's grants, you can use those tokens for pushing and pulling from git repos as well.
 *
 * In this situation, you want to return an object with `{ username, password }`
 * where `username` and `password` depend on where the repo is hosted.
 *
 * ### Option 2: Headers
 *
 * This is the super flexible option. Just return the HTTP headers you want to add as an object with `{ headers }`.
 * If you can provide `{ username, password, headers }` if you want.
 * (Although if `headers` includes an `Authentication` property
 * that overwrites what you would normally get from `username`/`password`.)
 *
 * To re-implement the default Basic Auth behavior, do something like this:
 *
 * ```js
 * const auth = {
 *   headers: {
 *     Authentication: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
 *   }
 * }
 * ```
 *
 * If you are using a custom proxy server that has its own authentication
 * in addition to the destination authentication, you could inject it like so:
 *
 * ```js
 * const auth = {
 *   username,
 *   password,
 *   headers: {
 *     'X-Authentication': `Bearer ${token}`
 *   }
 * }
 * ```
 *
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
