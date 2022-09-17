import { _readCommit } from '../commands/readCommit'
import { FsClient, Cache } from '../models'
import { FileSystem } from '../models/FileSystem'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


type ReadCommitParams = {
  /** A file system client. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string

  /** The SHA-1 object id to get. Annotated tags are peeled. */
  oid: string

  /** A cache object. */
  cache?: Cache
}

/**
 * Read a commit object directly.
 *
 * @param {ReadCommitParams} args
 *
 * @returns {Promise<ReadCommitResult>} Resolves successfully with a git commit object
 * @see ReadCommitResult
 * @see CommitObject
 *
 * @example
 * // Read a commit object
 * let sha = await git.resolveRef({ fs, dir: '/tutorial', ref: 'main' })
 * console.log(sha)
 * let commit = await git.readCommit({ fs, dir: '/tutorial', oid: sha })
 * console.log(commit)
 *
 */
export async function readCommit({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  oid,
  cache = {},
}: ReadCommitParams) {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)
    assertParameter('oid', oid)

    return await _readCommit({ fs: new FileSystem(fs), cache, gitdir, oid })
  } catch (err: any) {
    err.caller = 'git.readCommit'
    throw err
  }
}
