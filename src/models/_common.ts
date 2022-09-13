/**
 * The details about the author.
 */
export type Author = {
  /** Default is `user.name` config. */
  name: string

  /** Default is `user.email` config. */
  email?: string

  /** Set the author timestamp field. This is the integer number of seconds since the Unix epoch (1970-01-01 00:00:00). */
  timestamp?: number

  /** Set the author timezone offset field. This is the difference, in minutes, from the current timezone to UTC. Default is `(new Date()).getTimezoneOffset()`. */
  timezoneOffset?: number
}

export type NormalizedAuthor = {
  name: string
  email: string
  timestamp: number
  timezoneOffset: number
}

type SignCallbackParams = {
  /** A plaintext message. */
  payload: string

  /** 'ASCII armor' encoded PGP key (technically can actually contain _multiple_ keys). */
  secretKey: string
}

export type SignCallback =
  (args: SignCallbackParams) => { signature: string } | Promise<{ signature: string }>

type GitProgressEvent = {
  phase: string
  loaded: number
  total?: number
}

export type ProgressCallback = (args: GitProgressEvent) => Promise<void>

export type MessageCallback = (message: string) => void | Promise<void>

export type GitAuth = {
  username?: string
  password?: string
  headers?: HttpHeaders
  /** Tells git to throw a `UserCanceledError` (instead of an `HttpError`). */
  cancel?: boolean
}

export type AuthCallback = (url: string, auth: GitAuth) => GitAuth | void | Promise<GitAuth | void>

export type AuthFailureCallback = (url: string, auth: GitAuth) => GitAuth | void | Promise<GitAuth | void>

export type AuthSuccessCallback = (url: string, auth: GitAuth) => void | Promise<void>

export type WalkerEntryType = 'blob' | 'tree' | 'commit' | 'special'

export type WalkerEntry = {
  content(): Promise<Uint8Array | void>
  type(): Promise<WalkerEntryType>
  mode(): Promise<number>
  oid(): Promise<string>
}

export type BlobMergeCallback = (
  filePath: string,
  theirBlob: WalkerEntry | null,
  baseBlob: WalkerEntry | null,
  ourBlob: WalkerEntry | null,
  theirName: string,
  baseName: string,
  ourName: string
) => Promise<{ mergedText: string, mode: number } | { oid: string, mode: number } | undefined>


// HTTP
export type HttpHeaders = {
  [ header: string ]: string
}

export type GitHttpRequest = {
  /** The URL to request. */
  url: string

  /** The HTTP method to use. */
  method?: string

  /** Headers to include in the HTTP request. */
  headers?: HttpHeaders

  /** An async iterator of Uint8Arrays or array that make up the body of POST requests. */
  body?: Uint8Array[] | AsyncIterableIterator<Uint8Array>

  /** Reserved for future use (emitting `GitProgressEvent`s). */
  onProgress?: ProgressCallback
}

export type GitHttpResponse = {
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

export type HttpFetch = (request: GitHttpRequest) => Promise<GitHttpResponse>

export type HttpClient = {
  request: HttpFetch
}
