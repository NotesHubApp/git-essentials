import { Buffer } from 'buffer'

import { HttpError } from '../errors/HttpError'
import { SmartHttpError } from '../errors/SmartHttpError'
import { UserCanceledError } from '../errors/UserCanceledError'
import {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  Auth,
  HttpResponse,
  HttpClient,
  HttpHeaders,
  ProgressCallback
} from '../models'
import { calculateBasicAuthHeader } from '../utils/calculateBasicAuthHeader'
import { collect } from '../utils/collect'
import { extractAuthFromUrl } from '../utils/extractAuthFromUrl'
import { parseRefsAdResponse, RemoteHTTPV1, RemoteHTTPV2 } from '../wire/parseRefsAdResponse'


const updateHeaders = (headers: HttpHeaders, auth: Auth) => {
  // Update the basic auth header
  if (auth.username || auth.password) {
    headers.Authorization = calculateBasicAuthHeader(auth)
  }

  // but any manually provided headers take precedence
  if (auth.headers) {
    Object.assign(headers, auth.headers)
  }
}

/**
 * @param {HttpResponse} res
 *
 * @returns {{ preview: string, response: string, data: Buffer }}
 */
const stringifyBody = async (res: HttpResponse) => {
  try {
    // Some services provide a meaningful error message in the body of 403s like "token lacks the scopes necessary to perform this action"
    const data = Buffer.from(await collect(res.body!))
    const response = data.toString('utf8')
    const preview =
      response.length < 256 ? response : response.slice(0, 256) + '...'
    return { preview, response, data }
  } catch (e) {
    return {}
  }
}

type ProtocolVersion = 1 | 2

/** @internal */
export type DiscoverParams<T> = {
  http: HttpClient
  onProgress?: ProgressCallback
  onAuth?: AuthCallback
  onAuthSuccess?: AuthSuccessCallback
  onAuthFailure?: AuthFailureCallback
  service: string
  url: string
  headers: HttpHeaders
  protocolVersion: T
}

/** @internal */
export type RemoteHTTP<T> =
  T extends 1 ? { auth: Auth } & RemoteHTTPV1 :
  T extends 2 ? { auth: Auth } & RemoteHTTPV2 :
  never

/** @internal */
export type ConnectParams = {
  http: HttpClient
  onProgress?: ProgressCallback
  service: string
  url: string
  auth: Auth
  body: Uint8Array[] | AsyncIterableIterator<Uint8Array>
  headers: HttpHeaders
}

/** @internal */
export class GitRemoteHTTP {
  static async capabilities() {
    return ['discover', 'connect']
  }

  static async discover<T extends ProtocolVersion>({
    http,
    onProgress,
    onAuth,
    onAuthSuccess,
    onAuthFailure,
    service,
    url: _origUrl,
    headers,
    protocolVersion,
  }: DiscoverParams<T>): Promise<RemoteHTTP<T>> {
    let { url, auth } = extractAuthFromUrl(_origUrl)

    if (auth.username || auth.password) {
      headers.Authorization = calculateBasicAuthHeader(auth)
    }

    if (protocolVersion === 2) {
      headers['Git-Protocol'] = 'version=2'
    }

    let res: HttpResponse
    let tryAgain: boolean
    let providedAuthBefore = false

    do {
      if (onAuth && !providedAuthBefore) {
        // Acquire credentials
        // TODO: read `useHttpPath` value from git config and pass along?
        auth = (await onAuth(url, {...auth, headers: { ...headers } }))!
        if (auth && auth.cancel) {
          throw new UserCanceledError()
        } else if (auth) {
          updateHeaders(headers, auth)
          providedAuthBefore = true
        }
      }

      res = await http.request({
        onProgress,
        method: 'GET',
        url: `${url}/info/refs?service=${service}`,
        headers,
      })

      // the default loop behavior
      tryAgain = false

      // 401 is the "correct" response for access denied. 203 is Non-Authoritative Information and comes from Azure DevOps, which
      // apparently doesn't realize this is a git request and is returning the HTML for the "Azure DevOps Services | Sign In" page.
      if (res.statusCode === 401 || res.statusCode === 203) {
        // On subsequent 401s, call `onAuthFailure` instead of `onAuth`.
        // This is so that naive `onAuth` callbacks that return a fixed value don't create an infinite loop of retrying.
        if (onAuthFailure) {
          // Acquire credentials and try again
          // TODO: read `useHttpPath` value from git config and pass along?
          auth = (await onAuthFailure(url, {...auth, headers: { ...headers } }))!
          if (auth && auth.cancel) {
            throw new UserCanceledError()
          } else if (auth) {
            updateHeaders(headers, auth)
            providedAuthBefore = true
            tryAgain = true
          }
        }
      } else if (
        res.statusCode === 200 &&
        providedAuthBefore &&
        onAuthSuccess
      ) {
        await onAuthSuccess(url, auth)
      }
    } while (tryAgain)

    if (res.statusCode !== 200) {
      const { response } = await stringifyBody(res)
      throw new HttpError(res.statusCode, res.statusMessage, res.url, res.method, response, res.headers)
    }

    // Git "smart" HTTP servers should respond with the correct Content-Type header.
    if (res.headers['content-type'] === `application/x-${service}-advertisement`) {
      const remoteHTTP = await parseRefsAdResponse(res.body!, { service })
      return { ...remoteHTTP, auth } as RemoteHTTP<T>
    } else {
      // If they don't send the correct content-type header, that's a good indicator it is either a "dumb" HTTP
      // server, or the user specified an incorrect remote URL and the response is actually an HTML page.
      // In this case, we save the response as plain text so we can generate a better error message if needed.
      const { preview, response, data } = await stringifyBody(res)
      // For backwards compatibility, try to parse it anyway.
      // TODO: maybe just throw instead of trying?
      try {
        const remoteHTTP = await parseRefsAdResponse([data!], { service })
        return { ...remoteHTTP, auth } as RemoteHTTP<T>
      } catch (e) {
        throw new SmartHttpError(preview, response)
      }
    }
  }

  /**
   * @param {Object} args
   * @param {HttpClient} args.http
   * @param {ProgressCallback} [args.onProgress]
   * @param {string} args.service
   * @param {string} args.url
   * @param {Object<string, string>} [args.headers]
   * @param {any} args.body
   * @param {any} args.auth
   */
  static async connect({
    http,
    onProgress,
    service,
    url,
    auth,
    body,
    headers,
  }: ConnectParams) {
    // We already have the "correct" auth value at this point, but
    // we need to strip out the username/password from the URL yet again.
    const urlAuth = extractAuthFromUrl(url)
    if (urlAuth) url = urlAuth.url

    headers['content-type'] = `application/x-${service}-request`
    headers.accept = `application/x-${service}-result`
    updateHeaders(headers, auth)

    const res = await http.request({
      onProgress,
      method: 'POST',
      url: `${url}/${service}`,
      body,
      headers,
    })
    if (res.statusCode !== 200) {
      const { response } = await stringifyBody(res)
      throw new HttpError(res.statusCode, res.statusMessage, res.url, res.method, response, res.headers)
    }
    return res
  }
}
