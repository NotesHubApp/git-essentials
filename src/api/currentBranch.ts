import { _currentBranch } from '../commands/currentBranch'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


export type CurrentBranchParams = {
  /** A file system implementation. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string

  /** Return the full path (e.g. "refs/heads/main") instead of the abbreviated form. */
  fullname?: boolean

  /** If the current branch doesn't actually exist (such as right after git init) then return `undefined`. */
  test?: boolean
}

/**
 * Get the name of the branch currently pointed to by .git/HEAD.
 *
 * @param args
 *
 * @returns The name of the current branch or undefined if the HEAD is detached.
 *
 * @example
 * // Get the current branch name
 * const branch = await currentBranch({
 *   fs,
 *   dir: '/tutorial',
 *   fullname: false
 * })
 * console.log(branch)
 *
 */
export async function currentBranch({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  fullname = false,
  test = false,
}: CurrentBranchParams): Promise<string | undefined> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)
    return await _currentBranch({
      fs: new FileSystem(fs),
      gitdir,
      fullname,
      test,
    })
  } catch (err: any) {
    err.caller = 'git.currentBranch'
    throw err
  }
}
