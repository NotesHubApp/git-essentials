import {
  GitHttpRequest,
  GitHttpResponse,
  HttpClient,
  HttpHeaders
} from '../../../'
import { collect } from '../../../utils/collect'
import { fromStream } from '../../../utils/fromStream'


type TransformRequestUrl = (originalUrl: string, hasCredentials?: boolean) => string

const DefaultTransformRequestUrl: TransformRequestUrl = (originalUrl) => originalUrl

export type WebHttpClientOptions = {
  transformRequestUrl?: TransformRequestUrl
  retriesCount?: number
}

export function makeWebHttpClient(options: WebHttpClientOptions = {}): HttpClient {
  const transformRequestUrl = options.transformRequestUrl ?? DefaultTransformRequestUrl
  const retriesCount = options.retriesCount ?? 3

  /**
   * HttpClient
   *
   * @param {GitHttpRequest} request
   * @returns {Promise<GitHttpResponse>}
   */
  async function request(
    {onProgress, url, method = 'GET', headers = {}, body }: GitHttpRequest):
    Promise<GitHttpResponse> {

    async function fetchWithRetry(url: string, options: RequestInit, n = 1): Promise<Response> {
      try {
        const targetUrl = transformRequestUrl(url, Boolean(options.credentials));
        return await fetch(targetUrl, options)
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
