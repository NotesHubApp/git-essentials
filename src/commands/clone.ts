import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { _addRemote } from '../commands/addRemote'
import { _checkout } from '../commands/checkout'
import { _fetch } from '../commands/fetch'
import { _init } from '../commands/init'
import { deleteRecursively } from '../utils/deleteRecursively'
import {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  HttpClient,
  HttpHeaders,
  MessageCallback,
  ProgressCallback
} from '../models'
import { Errors } from '..'


type CloneParams = {
  fs: FileSystem
  cache: Cache
  http: HttpClient
  onProgress?: ProgressCallback
  onMessage?: MessageCallback
  onAuth?: AuthCallback
  onAuthSuccess?: AuthSuccessCallback
  onAuthFailure?: AuthFailureCallback
  dir: string
  gitdir: string
  url: string
  ref?: string
  remote: string
  depth?: number
  since?: Date
  exclude: string[]
  relative: boolean
  singleBranch: boolean
  noCheckout: boolean
  noTags: boolean
  headers: HttpHeaders
}

/**
 * @param {CloneParams} args
 * @returns {Promise<void>} Resolves successfully when clone completes
 * @internal
 */
export async function _clone({
  fs,
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
}: CloneParams): Promise<void> {
  try {
    await _init({ fs, dir, gitdir })
    await _addRemote({ fs, gitdir, remote, url, force: false })
    const { defaultBranch, fetchHead } = await _fetch({
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
      remote,
      depth,
      since,
      exclude,
      relative,
      singleBranch,
      headers,
      tags: !noTags,
    })

    if (fetchHead === null) return
    ref = ref || defaultBranch!
    ref = ref.replace('refs/heads/', '')

    // Checkout that branch
    await _checkout({
      fs,
      cache,
      onProgress,
      dir,
      gitdir,
      ref,
      remote,
      noCheckout,
    })
  } catch (err: any) {
    if (!(err instanceof Errors.AlreadyExistsError)) {
      // Remove partial local repository
      try {
        await deleteRecursively({ fs, dirname: gitdir })
      } catch (err) {
        // Ignore this error, we are already failing.
        // This try-catch is necessary so the original error is
        // not masked by potential errors in deleteRecursively.
      }
    }

    throw err
  }
}
