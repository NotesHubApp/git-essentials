import { FetchResult, _fetch } from '../commands/fetch'
import { AuthCallback, AuthFailureCallback, AuthSuccessCallback, HttpClient, HttpHeaders, MessageCallback, ProgressCallback } from '../models'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { Cache } from '../models/Cache'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'

export { FetchResult }

type FetchParams = {
  /** A file system client. */
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

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string

  /** Which branch to fetch if `singleBranch` is true. By default this is the current branch or the remote's default branch. */
  ref?: string

  /** The name of the branch on the remote to fetch if `singleBranch` is true. By default this is the configured remote tracking branch. */
  remoteRef?: string

  /** If URL is not specified, determines which remote to use. */
  remote?: string

  /** The URL of the remote repository. The default is the value set in the git config for that remote. */
  url: string | void

  /** Determines how much of the git repository's history to retrieve. */
  depth?: number | null,

  /** Only fetch commits created after the given date. Mutually exclusive with `depth`. */
  since?: Date | null,

  /** A list of branches or tags. Instructs the remote server not to send us any commits reachable from these refs. */
  exclude?: string[]

  /** Changes the meaning of `depth` to be measured from the current shallow depth rather than from the branch tip. */
  relative?: boolean

  /** Also fetch tags. */
  tags?: boolean

  /** Instead of the default behavior of fetching all the branches, only fetch a single branch. */
  singleBranch?: boolean

  /** Additional headers to include in HTTP requests, similar to git's `extraHeader` config. */
  headers?: HttpHeaders

  /** Delete local remote-tracking branches that are not present on the remote. */
  prune?: boolean

  /** Prune local tags that don’t exist on the remote, and force-update those tags that differ. */
  pruneTags?: boolean

  /** A cache object. */
  cache?: Cache
}

/**
 * Fetch commits from a remote repository.
 *
 * @param {FetchParams} args
 *
 * @returns {Promise<FetchResult>} Resolves successfully when fetch completes
 * @see FetchResult
 *
 * @example
 * let result = await git.fetch({
 *   fs,
 *   http,
 *   dir: '/tutorial',
 *   url: 'https://github.com/NotesHubApp/git-essentials',
 *   ref: 'main',
 *   depth: 1,
 *   singleBranch: true,
 *   tags: false
 * })
 * console.log(result)
 *
 */
export async function fetch({
  fs,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir = join(dir, '.git'),
  ref,
  remote,
  remoteRef,
  url,
  depth = null,
  since = null,
  exclude = [],
  relative = false,
  tags = false,
  singleBranch = false,
  headers = {},
  prune = false,
  pruneTags = false,
  cache = {},
}: FetchParams): Promise<FetchResult> {
  try {
    assertParameter('fs', fs)
    assertParameter('http', http)
    assertParameter('gitdir', gitdir)

    return await _fetch({
      fs: new FileSystem(fs),
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      gitdir,
      ref,
      remote,
      remoteRef,
      url,
      depth,
      since,
      exclude,
      relative,
      tags,
      singleBranch,
      headers,
      prune,
      pruneTags,
    })
  } catch (err: any) {
    err.caller = 'git.fetch'
    throw err
  }
}
