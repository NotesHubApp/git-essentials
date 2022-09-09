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
  username: string
  password: string
  headers: { [header: string]: string }
  // Tells git to throw a `UserCanceledError` (instead of an `HttpError`).
  cancel: boolean
}

export type AuthCallback = (url: string, auth: GitAuth) => GitAuth | void | Promise<GitAuth | void>
export type AuthFailureCallback = (url: string, auth: GitAuth) => GitAuth | void | Promise<GitAuth | void>
export type AuthSuccessCallback = (url: string, auth: GitAuth) => void | Promise<void>
