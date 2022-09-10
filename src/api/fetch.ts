import { FetchResult, _fetch } from '../commands/fetch'
import { AuthCallback, AuthFailureCallback, AuthSuccessCallback, HttpClient, HttpHeaders, MessageCallback, ProgressCallback } from '../models'
import { FileSystem } from '../models/FileSystem'
import { IBackend } from '../models/IBackend'
import { Cache } from '../models/Cache'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'

type FetchParams = {
  fs: IBackend
  http: HttpClient
  onProgress?: ProgressCallback
  onMessage?: MessageCallback
  onAuth?: AuthCallback
  onAuthSuccess?: AuthSuccessCallback
  onAuthFailure?: AuthFailureCallback
  dir: string
  gitdir?: string
  ref?: string
  remoteRef?: string
  remote?: string
  url: string | void
  corsProxy?: string
  depth?: number | null,
  since?: Date | null,
  exclude?: string[]
  relative?: boolean
  tags?: boolean
  singleBranch?: boolean
  headers?: HttpHeaders
  prune?: boolean
  pruneTags?: boolean
  cache?: Cache
}

/**
 * Fetch commits from a remote repository
 *
 * @param {object} args
 * @param {FsClient} args.fs - a file system client
 * @param {HttpClient} args.http - an HTTP client
 * @param {ProgressCallback} [args.onProgress] - optional progress event callback
 * @param {MessageCallback} [args.onMessage] - optional message event callback
 * @param {AuthCallback} [args.onAuth] - optional auth fill callback
 * @param {AuthFailureCallback} [args.onAuthFailure] - optional auth rejected callback
 * @param {AuthSuccessCallback} [args.onAuthSuccess] - optional auth approved callback
 * @param {string} [args.dir] - The [working tree](dir-vs-gitdir.md) directory path
 * @param {string} [args.gitdir=join(dir,'.git')] - [required] The [git directory](dir-vs-gitdir.md) path
 * @param {string} [args.url] - The URL of the remote repository. The default is the value set in the git config for that remote.
 * @param {string} [args.remote] - If URL is not specified, determines which remote to use.
 * @param {boolean} [args.singleBranch = false] - Instead of the default behavior of fetching all the branches, only fetch a single branch.
 * @param {string} [args.ref] - Which branch to fetch if `singleBranch` is true. By default this is the current branch or the remote's default branch.
 * @param {string} [args.remoteRef] - The name of the branch on the remote to fetch if `singleBranch` is true. By default this is the configured remote tracking branch.
 * @param {boolean} [args.tags = false] - Also fetch tags
 * @param {number} [args.depth] - Integer. Determines how much of the git repository's history to retrieve
 * @param {boolean} [args.relative = false] - Changes the meaning of `depth` to be measured from the current shallow depth rather than from the branch tip.
 * @param {Date} [args.since] - Only fetch commits created after the given date. Mutually exclusive with `depth`.
 * @param {string[]} [args.exclude = []] - A list of branches or tags. Instructs the remote server not to send us any commits reachable from these refs.
 * @param {boolean} [args.prune] - Delete local remote-tracking branches that are not present on the remote
 * @param {boolean} [args.pruneTags] - Prune local tags that don’t exist on the remote, and force-update those tags that differ
 * @param {string} [args.corsProxy] - Optional [CORS proxy](https://www.npmjs.com/%40isomorphic-git/cors-proxy). Overrides value in repo config.
 * @param {Object<string, string>} [args.headers] - Additional headers to include in HTTP requests, similar to git's `extraHeader` config
 * @param {object} [args.cache] - a [cache](cache.md) object
 *
 * @returns {Promise<FetchResult>} Resolves successfully when fetch completes
 * @see FetchResult
 *
 * @example
 * let result = await git.fetch({
 *   fs,
 *   http,
 *   dir: '/tutorial',
 *   corsProxy: 'https://cors.isomorphic-git.org',
 *   url: 'https://github.com/isomorphic-git/isomorphic-git',
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
  corsProxy,
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
      corsProxy,
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
