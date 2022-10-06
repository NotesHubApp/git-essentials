import { FileSystem } from '../models/FileSystem'
import { GitRefManager } from '../managers/GitRefManager'
import { abbreviateRef } from '../utils/abbreviateRef'


type CurrentBranchParams = {
  fs: FileSystem

  gitdir: string

  /** Return the full path (e.g. "refs/heads/main") instead of the abbreviated form. */
  fullname?: boolean

  /** If the current branch doesn't actually exist (such as right after git init) then return `undefined`. */
  test?: boolean
}

/**
 * @param {CurrentBranchParams} args
 * @returns {Promise<string|undefined>} The name of the current branch or undefined if the HEAD is detached.
 * @internal
 */
export async function _currentBranch(
  { fs, gitdir, fullname = false, test = false }: CurrentBranchParams): Promise<string | undefined> {
  const ref = await GitRefManager.resolve({
    fs,
    gitdir,
    ref: 'HEAD',
    depth: 2,
  })
  if (test) {
    try {
      await GitRefManager.resolve({ fs, gitdir, ref })
    } catch (_) {
      return
    }
  }
  // Return `undefined` for detached HEAD
  if (!ref.startsWith('refs/')) return
  return fullname ? ref : abbreviateRef(ref)
}
