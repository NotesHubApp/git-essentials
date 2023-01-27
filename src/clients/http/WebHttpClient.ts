/**
 * @module WebHttpClient
 */

import {
  HttpRequest,
  HttpResponse,
  HttpClient,
  HttpHeaders
} from '../..'
import { collect } from '../../utils/collect'
import { fromStream } from '../../utils/fromStream'


export type TransformRequestUrl = (originalUrl: string, hasCredentials?: boolean) => string

const DefaultTransformRequestUrl: TransformRequestUrl = (originalUrl) => originalUrl

export type WebHttpClientOptions = {
  /**
   * The transform request URL function, which could be useful in a browser environment
   * when the host does not return the proper `Access-Control-Allow-Origin` header
   * and CORS proxy is required to fulfill the request.
   */
  transformRequestUrl?: TransformRequestUrl

  /**
   * Optional Fetch API implementation, could be useful for testing.
   */
  fetch?: (url: string, init?: RequestInit) => Promise<Response>

  /**
   * The number of retries that the client attempt to do on failure.
   */
  retriesCount?: number
}

/**
 * Makes HTTP client that works in a browser environment.
 */
export function makeWebHttpClient(options: WebHttpClientOptions = {}): HttpClient {
  const transformRequestUrl = options.transformRequestUrl ?? DefaultTransformRequestUrl
  const fetchImpl = options.fetch ?? globalThis.fetch
  const retriesCount = options.retriesCount ?? 3

  /**
   * HttpClient
   *
   * @param {HttpRequest} request
   * @returns {Promise<HttpResponse>}
   */
  async function request(
    {onProgress, url, method = 'GET', headers = {}, body }: HttpRequest):
    Promise<HttpResponse> {

    async function fetchWithRetry(url: string, options: RequestInit, n = 1): Promise<Response> {
      try {
        const targetUrl = transformRequestUrl(url, Boolean(options.credentials));
        return await fetchImpl(targetUrl, options)
      } catch (err) {
        if (n <= 1) {
          throw err
        }
        return fetchWithRetry(url, options, n - 1)
      }
    }

    // streaming uploads aren't possible yet in the browser
    const bodyArr = body ? await collect(body) : undefined
    const res = await fetchWithRetry(url, { method, headers, body: bodyArr }, retriesCount)
    const iter = res.body && 'getReader' in res.body
        ? fromStream(res.body)
        : [new Uint8Array(await res.arrayBuffer())]
    // convert Header object to ordinary JSON
    const responseHeaders: HttpHeaders = {}
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return {
      url: res.url,
      method: method,
      statusCode: res.status,
      statusMessage: res.statusText,
      body: iter,
      headers: responseHeaders,
    }
  }

  return { request }
}
