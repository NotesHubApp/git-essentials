import { Cache } from '../models/Cache'
import { _checkout } from '../commands/checkout'
import { FileSystem } from '../models/FileSystem'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'
import { FsClient } from '../models/FsClient'
import { ProgressCallback } from '../models'

type CheckoutParams = {
  /** A file system implementation. */
  fs: FsClient

  /** Optional progress event callback. */
  onProgress?: ProgressCallback

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string

  /** Which remote repository to use (default: `origin`). */
  remote?: string

  /** Source to checkout files from (default: `HEAD`). */
  ref?: string

  /** Limit the checkout to the given files and directories. */
  filepaths?: string[]

  /** If true, will update HEAD but won't update the working directory. */
  noCheckout?: boolean

  /** If true, will update the working directory but won't update HEAD. Defaults to `false` when `ref` is provided, and `true` if `ref` is not provided. */
  noUpdateHead?: boolean

  /** If true, simulates a checkout so you can test whether it would succeed. */
  dryRun?: boolean

  /** If true, conflicts will be ignored and files will be overwritten regardless of local changes. */
  force?: boolean

  /** A cache object. */
  cache?: Cache
}

/**
 * Checkout a branch.
 *
 * If the branch already exists it will check out that branch. Otherwise, it will create a new remote tracking branch set to track the remote branch of that name.
 *
 * @param {CheckoutParams} args
 *
 * @returns {Promise<void>} Resolves successfully when filesystem operations are complete
 *
 * @example
 * // switch to the main branch
 * await git.checkout({
 *   fs,
 *   dir: '/tutorial',
 *   ref: 'main'
 * })
 * console.log('done')
 *
 * @example
 * // restore the 'docs' and 'src/docs' folders to the way they were, overwriting any changes
 * await git.checkout({
 *   fs,
 *   dir: '/tutorial',
 *   force: true,
 *   filepaths: ['docs', 'src/docs']
 * })
 * console.log('done')
 *
 * @example
 * // restore the 'docs' and 'src/docs' folders to the way they are in the 'develop' branch, overwriting any changes
 * await git.checkout({
 *   fs,
 *   dir: '/tutorial',
 *   ref: 'develop',
 *   noUpdateHead: true,
 *   force: true,
 *   filepaths: ['docs', 'src/docs']
 * })
 * console.log('done')
 */
export async function checkout({
  fs,
  onProgress,
  dir,
  gitdir = join(dir, '.git'),
  remote = 'origin',
  ref: _ref,
  filepaths,
  noCheckout = false,
  noUpdateHead = _ref === undefined,
  dryRun = false,
  force = false,
  cache = {},
}: CheckoutParams): Promise<void> {
  try {
    assertParameter('fs', fs)
    assertParameter('dir', dir)
    assertParameter('gitdir', gitdir)

    const ref = _ref || 'HEAD'
    return await _checkout({
      fs: new FileSystem(fs),
      cache,
      onProgress,
      dir,
      gitdir,
      remote,
      ref,
      filepaths,
      noCheckout,
      noUpdateHead,
      dryRun,
      force,
    })
  } catch (err: any) {
    err.caller = 'git.checkout'
    throw err
  }
}
