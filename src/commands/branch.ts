import cleanGitRef from 'clean-git-ref'

import { FileSystem } from '../models/FileSystem'
import { AlreadyExistsError } from '../errors/AlreadyExistsError'
import { InvalidRefNameError } from '../errors/InvalidRefNameError'
import { GitRefManager } from '../managers/GitRefManager'

type BranchParams = {
  fs: FileSystem
  gitdir: string
  ref: string
  checkout?: boolean
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
 * await git.branch({ dir: '$input((/))', ref: '$input((develop))' })
 * console.log('done')
 *
 */
export async function _branch(
  { fs, gitdir, ref, checkout = false, force = false }: BranchParams): Promise<void> {
  if (ref !== cleanGitRef.clean(ref)) {
    throw new InvalidRefNameError(ref, cleanGitRef.clean(ref))
  }

  const fullref = `refs/heads/${ref}`

  if (!force) {
    const exist = await GitRefManager.exists({ fs, gitdir, ref: fullref })
    if (exist) {
      throw new AlreadyExistsError('branch', ref, false)
    }
  }

  // Get current HEAD tree oid
  let oid: string | undefined
  try {
    oid = await GitRefManager.resolve({ fs, gitdir, ref: 'HEAD' })
  } catch (e) {
    // Probably an empty repo
  }

  // Create a new ref that points at the current commit
  if (oid) {
    await GitRefManager.writeRef({ fs, gitdir, ref: fullref, value: oid })
  }

  if (checkout) {
    // Update HEAD
    await GitRefManager.writeSymbolicRef({
      fs,
      gitdir,
      ref: 'HEAD',
      value: fullref,
    })
  }
}
