import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { _addRemote } from '../commands/addRemote'
import { _checkout } from '../commands/checkout'
import { _fetch } from '../commands/fetch'
import { _init } from '../commands/init'
import {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  HttpClient,
  HttpHeaders,
  MessageCallback,
  ProgressCallback
} from '../models'


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
 * @param {object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {object} args.cache
 * @param {HttpClient} args.http
 * @param {ProgressCallback} [args.onProgress]
 * @param {MessageCallback} [args.onMessage]
 * @param {AuthCallback} [args.onAuth]
 * @param {AuthFailureCallback} [args.onAuthFailure]
 * @param {AuthSuccessCallback} [args.onAuthSuccess]
 * @param {string} [args.dir]
 * @param {string} args.gitdir
 * @param {string} args.url
 * @param {string} args.ref
 * @param {boolean} args.singleBranch
 * @param {boolean} args.noCheckout
 * @param {boolean} args.noTags
 * @param {string} args.remote
 * @param {number} args.depth
 * @param {Date} args.since
 * @param {string[]} args.exclude
 * @param {boolean} args.relative
 * @param {Object<string, string>} args.headers
 *
 * @returns {Promise<void>} Resolves successfully when clone completes
 *
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
}: CloneParams) {
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
}
