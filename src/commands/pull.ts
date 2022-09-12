import { FileSystem } from '../models/FileSystem'
import { _checkout } from '../commands/checkout'
import { _currentBranch } from '../commands/currentBranch'
import { _fetch } from '../commands/fetch'
import { _merge } from '../commands/merge'
import { MissingParameterError } from '../errors/MissingParameterError'
import {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  BlobMergeCallback,
  Cache,
  HttpClient,
  HttpHeaders,
  MessageCallback,
  NormalizedAuthor,
  ProgressCallback
} from '../models'

type PullParams = {
  fs: FileSystem
  cache: Cache
  http: HttpClient
  onProgress?: ProgressCallback
  onMessage?: MessageCallback
  onAuth?: AuthCallback
  onAuthSuccess?: AuthSuccessCallback
  onAuthFailure?: AuthFailureCallback
  onBlobMerge?: BlobMergeCallback
  dir: string
  gitdir: string
  ref?: string
  url?: string
  remote?: string
  remoteRef?: string
  fastForwardOnly: boolean
  singleBranch?: boolean
  headers: HttpHeaders
  author: NormalizedAuthor
  committer: NormalizedAuthor
  signingKey?: string
}

/**
 * @param {object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {object} args.cache
 * @param {HttpClient} args.http
 * @param {ProgressCallback} [args.onProgress]
 * @param {MessageCallback} [args.onMessage]
 * @param {AuthCallback} [args.onAuth]
 * @param {AuthFailureCallback} [args.onAuthFailure]
 * @param {AuthSuccessCallback} [args.onAuthSuccess]
 * @param {BlobMergeCallback} [args.onBlobMerge]
 * @param {string} args.dir
 * @param {string} args.gitdir
 * @param {string} args.ref
 * @param {string} [args.url]
 * @param {string} [args.remote]
 * @param {string} [args.remoteRef]
 * @param {boolean} args.singleBranch
 * @param {boolean} args.fastForwardOnly
 * @param {Object<string, string>} [args.headers]
 * @param {NormalizedAuthor} args.author
 * @param {NormalizedAuthor} args.committer
 * @param {string} [args.signingKey]
 *
 * @returns {Promise<void>} Resolves successfully when pull operation completes
 *
 */
export async function _pull({
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
}: PullParams) {
  try {
    // If ref is undefined, use 'HEAD'
    if (!ref) {
      const head = await _currentBranch({ fs, gitdir })
      // TODO: use a better error.
      if (!head) {
        throw new MissingParameterError('ref')
      }
      ref = head
    }

    const { fetchHead, fetchHeadDescription } = await _fetch({
      fs,
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      gitdir,
      ref,
      url,
      remote,
      remoteRef,
      singleBranch,
      headers,
    })
    // Merge the remote tracking branch into the local one.
    await _merge({
      fs,
      cache,
      dir,
      gitdir,
      ours: ref,
      theirs: fetchHead!,
      fastForwardOnly,
      message: `Merge ${fetchHeadDescription}`,
      author,
      committer,
      signingKey,
      dryRun: false,
      noUpdateBranch: false,
      onBlobMerge,
    })
    await _checkout({
      fs,
      cache,
      onProgress,
      dir,
      gitdir,
      ref,
      remote,
      noCheckout: false,
    })
  } catch (err: any) {
    err.caller = 'git.pull'
    throw err
  }
}
