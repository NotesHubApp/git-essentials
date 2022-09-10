export type Author = {
  name: string
  email: string
  timestamp: number
  timezoneOffset: number
}


export type SignCallbackParams = {
  payload: string  // plaintext message
  secretKey: string // 'ASCII armor' encoded PGP key (technically can actually contain _multiple_ keys)
}

export type SignCallback =
  (args: SignCallbackParams) => { signature: string } | Promise<{ signature: string }> // an 'ASCII armor' encoded "detached"


export type ProgressCallbackParams = {
  phase: string
  loaded: number
  total?: number
}

export type ProgressCallback = (args: ProgressCallbackParams) => Promise<void>


export type MessageCallback = (message: string) => void | Promise<void>

export type GitAuth = {
  username?: string
  password?: string
  headers?: HttpHeaders
  // Tells git to throw a `UserCanceledError` (instead of an `HttpError`).
  cancel?: boolean
}

export type AuthCallback = (url: string, auth: GitAuth) => GitAuth | void | Promise<GitAuth | void>
export type AuthFailureCallback = (url: string, auth: GitAuth) => GitAuth | void | Promise<GitAuth | void>
export type AuthSuccessCallback = (url: string, auth: GitAuth) => void | Promise<void>


// HTTP
export type HttpHeaders = {
  [ header: string ]: string
}

export type GitHttpRequest = {
  url: string // The URL to request
  method?: string // The HTTP method to use
  headers?: HttpHeaders // Headers to include in the HTTP request
  body?: AsyncIterableIterator<Uint8Array> // An async iterator of Uint8Arrays that make up the body of POST requests
  onProgress?: ProgressCallback // Reserved for future use (emitting `GitProgressEvent`s)
  signal?: object // Reserved for future use (canceling a request)
}

export type GitHttpResponse = {
  url: string // The final URL that was fetched after any redirects
  method?: string // The HTTP method that was used
  headers: HttpHeaders // HTTP response headers
  body?: AsyncIterableIterator<Uint8Array> // An async iterator of Uint8Arrays that make up the body of the response
  statusCode: number // The HTTP status code
  statusMessage: string // The HTTP status message
}

export type HttpFetch = (request: GitHttpRequest) => Promise<GitHttpResponse>

export type HttpClient = {
  request: HttpFetch
}

