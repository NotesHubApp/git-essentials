import { _branch } from '../commands/branch'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


type BranchParams = {
  /** A file system implementation. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string

  /** What to name the branch. */
  ref: string

  /** What oid to use as the start point. Accepts a symbolic ref (default: `HEAD`). */
  startPoint?: string

  /** Update `HEAD` to point at the newly created branch. */
  checkout?: boolean

  /** Instead of throwing an error if a branched named `ref` already exists, overwrite the existing branch. */
  force?: boolean
}

/**
 * Create a branch.
 *
 * @param {BranchParams} args
 *
 * @returns {Promise<void>} Resolves successfully when filesystem operations are complete
 *
 * @example
 * await git.branch({ fs, dir: '/tutorial', ref: 'develop' })
 * console.log('done')
 *
 */
export async function branch({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  ref,
  startPoint = 'HEAD',
  checkout = false,
  force = false,
}: BranchParams): Promise<void> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)
    assertParameter('ref', ref)
    return await _branch({
      fs: new FileSystem(fs),
      gitdir,
      ref,
      checkout,
      startPoint,
      force
    })
  } catch (err: any) {
    err.caller = 'git.branch'
    throw err
  }
}
