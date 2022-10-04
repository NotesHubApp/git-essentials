import { Stat } from './FsClient'
import { HttpHeaders } from './HttpClient'


export type ConfigPath =
  | 'core.filemode'
  | 'core.bare'
  | 'core.logallrefupdates'
  | 'core.symlinks'
  | 'core.ignorecase'
  | 'core.bigFileThreshold'
  | string

export type ConfigValue<T> =
  T extends 'core.filemode' ? boolean :
  T extends 'core.bare' ? boolean :
  T extends 'core.logallrefupdates' ? boolean :
  T extends 'core.symlinks' ? boolean :
  T extends 'core.ignorecase' ? boolean :
  T extends 'core.bigFileThreshold' ? number :
  T extends string ? string :
  never;

type SignCallbackParams = {
  /** A plaintext message. */
  payload: string

  /** 'ASCII armor' encoded PGP key (technically can actually contain _multiple_ keys). */
  secretKey: string
}

export type SignCallback =
  (args: SignCallbackParams) => { signature: string } | Promise<{ signature: string }>

type ProgressEvent = {
  phase: string
  loaded: number
  total?: number
}

export type ProgressCallback = (args: ProgressEvent) => Promise<void>

export type MessageCallback = (message: string) => void | Promise<void>

export type Auth = {
  username?: string
  password?: string
  headers?: HttpHeaders
  /** Tells git to throw a `UserCanceledError` (instead of an `HttpError`). */
  cancel?: boolean
}

export type AuthCallback = (url: string, auth: Auth) => Auth | void | Promise<Auth | void>

export type AuthFailureCallback = (url: string, auth: Auth) => Auth | void | Promise<Auth | void>

export type AuthSuccessCallback = (url: string, auth: Auth) => void | Promise<void>

type WalkerEntryType = 'blob' | 'tree' | 'commit' | 'special'

/**
 * The `WalkerEntry` is an interface that abstracts computing many common tree / blob stats.
 */
export type WalkerEntry = {
  content(): Promise<Uint8Array | void>
  type(): Promise<WalkerEntryType>
  mode(): Promise<number>
  oid(): Promise<string>
  stat(): Promise<Stat | undefined | void>
}

export type BlobMergeCallbackParams = {
  filePath: string,
  theirBlob: WalkerEntry | null,
  baseBlob: WalkerEntry | null,
  ourBlob: WalkerEntry | null,
  theirName: string,
  baseName: string,
  ourName: string
}

export type BlobMergeCallbackResult =
  | { mergedText: string, mode: number }
  | { oid: string, mode: number }
  | undefined

export type BlobMergeCallback = (args: BlobMergeCallbackParams) => Promise<BlobMergeCallbackResult>
