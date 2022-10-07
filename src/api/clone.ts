import { _clone } from '../commands/clone'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'
import {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  HttpClient,
  HttpHeaders,
  MessageCallback,
  ProgressCallback
} from '../models'
import { Cache } from '../models/Cache'


export type CloneParams = {
  /** A file system implementation. */
  fs: FsClient

  /** An HTTP client. */
  http: HttpClient

  /** Optional progress event callback. */
  onProgress?: ProgressCallback

  /** Optional message event callback. */
  onMessage?: MessageCallback

  /** Optional auth fill callback. */
  onAuth?: AuthCallback

  /** Optional auth approved callback. */
  onAuthSuccess?: AuthSuccessCallback

  /** Optional auth rejected callback. */
  onAuthFailure?: AuthFailureCallback

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** The URL of the remote repository. */
  url: string

  /** Which branch to checkout. By default this is the designated "main branch" of the repository. */
  ref?: string

  /** What to name the remote that is created (default: `origin`). */
  remote?: string

  /** Determines how much of the git repository's history to retrieve. */
  depth?: number

  /** Only fetch commits created after the given date. Mutually exclusive with `depth`. */
  since?: Date

  /** A list of branches or tags. Instructs the remote server not to send us any commits reachable from these refs. */
  exclude?: string[]

  /** Changes the meaning of `depth` to be measured from the current shallow depth rather than from the branch tip. */
  relative?: boolean

  /** Instead of the default behavior of fetching all the branches, only fetch a single branch. */
  singleBranch?: boolean

  /** If true, clone will only fetch the repo, not check out a branch. Skipping checkout can save a lot of time normally spent writing files to disk. */
  noCheckout?: boolean

  /** By default clone will fetch all tags. `noTags` disables that behavior. */
  noTags?: boolean

  /** Additional headers to include in HTTP requests, similar to git's `extraHeader` config. */
  headers?: HttpHeaders

  /** A cache object. */
  cache?: Cache
}

/**
 * Clone a repository
 *
 * @param args
 *
 * @returns Resolves successfully when clone completes
 *
 * @example
 * await clone({
 *   fs,
 *   http,
 *   dir: '/tutorial',
 *   url: 'https://github.com/NotesHubApp/git-essentials',
 *   singleBranch: true,
 *   depth: 1
 * })
 *
 */
export async function clone({
  fs,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir = join(dir, '.git'),
  url,
  ref = undefined,
  remote = 'origin',
  depth = undefined,
  since = undefined,
  exclude = [],
  relative = false,
  singleBranch = false,
  noCheckout = false,
  noTags = false,
  headers = {},
  cache = {},
}: CloneParams): Promise<void> {
  try {
    assertParameter('fs', fs)
    assertParameter('http', http)
    assertParameter('gitdir', gitdir)
    if (!noCheckout) {
      assertParameter('dir', dir)
    }
    assertParameter('url', url)

    return await _clone({
      fs: new FileSystem(fs),
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      dir,
      gitdir,
      url,
      ref,
      remote,
      depth,
      since,
      exclude,
      relative,
      singleBranch,
      noCheckout,
      noTags,
      headers,
    })
  } catch (err: any) {
    err.caller = 'git.clone'
    throw err
  }
}
