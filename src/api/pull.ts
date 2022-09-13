import { _pull } from '../commands/pull'
import { MissingNameError } from '../errors/MissingNameError'
import { FileSystem } from '../models/FileSystem'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'
import { normalizeAuthorObject } from '../utils/normalizeAuthorObject'
import { normalizeCommitterObject } from '../utils/normalizeCommitterObject'
import {
  AuthCallback,
  AuthFailureCallback,
  Author,
  AuthSuccessCallback,
  BlobMergeCallback,
  Cache,
  FsClient,
  HttpClient,
  HttpHeaders,
  MessageCallback,
  ProgressCallback
} from '../models'


type PullParams = {
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

  /** Optional blob merge callback. */
  onBlobMerge?: BlobMergeCallback

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string

  /** Which branch to merge into. By default this is the currently checked out branch. */
  ref?: string

  /** The URL of the remote repository. The default is the value set in the git config for that remote. */
  url?: string

  /** If URL is not specified, determines which remote to use. */
  remote?: string

  /** The name of the branch on the remote to fetch. By default this is the configured remote tracking branch. */
  remoteRef?: string

  /** Only perform simple fast-forward merges (don't create merge commits). */
  fastForwardOnly?: boolean

  /** Instead of the default behavior of fetching all the branches, only fetch a single branch. */
  singleBranch?: boolean

  /** Additional headers to include in HTTP requests, similar to git's `extraHeader` config. */
  headers?: HttpHeaders

  /** The details about the author. */
  author?: Author

  /** The details about the commit committer, in the same format as the author parameter. If not specified, the author details are used. */
  committer?: Author

  /** passed to commit when creating a merge commit. */
  signingKey?: string

  /** A cache object. */
  cache?: Cache
}

/**
 * Fetch and merge commits from a remote repository.
 *
 * @param {PullParams} args
 *
 * @returns {Promise<void>} Resolves successfully when pull operation completes
 *
 * @example
 * await git.pull({
 *   fs,
 *   http,
 *   dir: '/tutorial',
 *   ref: 'main',
 *   singleBranch: true
 * })
 * console.log('done')
 *
 */
export async function pull({
  fs: _fs,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  onBlobMerge,
  dir,
  gitdir = join(dir, '.git'),
  ref,
  url,
  remote,
  remoteRef,
  fastForwardOnly = false,
  singleBranch,
  headers = {},
  author: _author,
  committer: _committer,
  signingKey,
  cache = {},
}: PullParams): Promise<void> {
  try {
    assertParameter('fs', _fs)
    assertParameter('gitdir', gitdir)

    const fs = new FileSystem(_fs)

    const author = await normalizeAuthorObject({ fs, gitdir, author: _author })
    if (!author) throw new MissingNameError('author')

    const committer = await normalizeCommitterObject({
      fs,
      gitdir,
      author,
      committer: _committer,
    })
    if (!committer) throw new MissingNameError('committer')

    return await _pull({
      fs,
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      onBlobMerge,
      dir,
      gitdir,
      ref,
      url,
      remote,
      remoteRef,
      fastForwardOnly,
      singleBranch,
      headers,
      author,
      committer,
      signingKey,
    })
  } catch (err: any) {
    err.caller = 'git.pull'
    throw err
  }
}
