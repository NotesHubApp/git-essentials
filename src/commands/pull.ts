import { FileSystem } from '../models/FileSystem'
import { _checkout } from '../commands/checkout'
import { _currentBranch } from '../commands/currentBranch'
import { _fetch } from '../commands/fetch'
import { _merge } from '../commands/merge'
import { MissingParameterError } from '../errors/MissingParameterError'
import { NormalizedAuthor } from '../models/NormalizedAuthor'
import {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  BlobMergeCallback,
  Cache,
  HttpClient,
  HttpHeaders,
  MessageCallback,
  ProgressCallback,
  SignCallback
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
  onSign?: SignCallback
  onBlobMerge?: BlobMergeCallback
  dir: string
  gitdir: string
  ref?: string
  url?: string
  remote?: string
  remoteRef?: string
  prune?: boolean
  pruneTags?: boolean
  fastForward: boolean
  fastForwardOnly: boolean
  singleBranch?: boolean
  headers: HttpHeaders
  author: NormalizedAuthor
  committer: NormalizedAuthor
  signingKey?: string
}

/**
 * @param {PullParams} args
 * @returns {Promise<void>} Resolves successfully when pull operation completes
 * @internal
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
  onSign,
  onBlobMerge,
  dir,
  gitdir,
  ref,
  url,
  remote,
  remoteRef,
  prune = false,
  pruneTags = false,
  fastForward,
  fastForwardOnly,
  singleBranch,
  headers,
  author,
  committer,
  signingKey,
}: PullParams): Promise<void> {
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
      prune,
      pruneTags
    })
    // Merge the remote tracking branch into the local one.
    await _merge({
      fs,
      cache,
      dir,
      gitdir,
      ours: ref,
      theirs: fetchHead!,
      fastForward,
      fastForwardOnly,
      message: `Merge ${fetchHeadDescription}`,
      author,
      committer,
      signingKey,
      dryRun: false,
      noUpdateBranch: false,
      onSign,
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
