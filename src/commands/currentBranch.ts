import { FileSystem } from '../models/FileSystem'
import { GitRefManager } from '../managers/GitRefManager'
import { abbreviateRef } from '../utils/abbreviateRef'

/**
 * @param {Object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {string} args.gitdir
 * @param {boolean} [args.fullname = false] - Return the full path (e.g. "refs/heads/main") instead of the abbreviated form.
 * @param {boolean} [args.test = false] - If the current branch doesn't actually exist (such as right after git init) then return `undefined`.
 *
 * @returns {Promise<string|void>} The name of the current branch or undefined if the HEAD is detached.
 *
 */
export async function _currentBranch(
  { fs, gitdir, fullname = false, test = false }:
  { fs: FileSystem, gitdir: string, fullname?: boolean, test?: boolean }): Promise<string | void> {
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
