import { ProgressCallback } from './_common'

export type HttpHeaders = {
  [ header: string ]: string
}

export type HttpRequest = {
  /** The URL to request. */
  url: string

  /** The HTTP method to use. */
  method?: string

  /** Headers to include in the HTTP request. */
  headers?: HttpHeaders

  /** An async iterator of Uint8Arrays or array that make up the body of POST requests. */
  body?: Uint8Array[] | AsyncIterableIterator<Uint8Array>

  /** Reserved for future use (emitting `ProgressEvent`s). */
  onProgress?: ProgressCallback
}

export type HttpResponse = {
  /** The final URL that was fetched after any redirects. */
  url: string

  /** The HTTP method that was used. */
  method?: string

  /** HTTP response headers. */
  headers: HttpHeaders

  /** An async iterator of Uint8Arrays or array that make up the body of the response. */
  body?: Uint8Array[] | AsyncIterableIterator<Uint8Array>

  /** The HTTP status code. */
  statusCode: number

  /** The HTTP status message. */
  statusMessage: string
}

export type HttpClient = {
  request: (request: HttpRequest) => Promise<HttpResponse>
}
