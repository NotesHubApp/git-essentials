import { _readCommit } from '../commands/readCommit'
import { FsClient, Cache, Commit } from '../models'
import { FileSystem } from '../models/FileSystem'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


export type ReadCommitParams = {
  /** A file system client. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** The SHA-1 object id to get. Annotated tags are peeled. */
  oid: string

  /** A cache object. */
  cache?: Cache
}

export type ReadCommitResult = {
  oid: string
  commit: Commit
  payload: string
}

/**
 * Read a commit object directly.
 *
 * @param args
 *
 * @returns Resolves successfully with a git commit object
 *
 * @example
 * // Read a commit object
 * const sha = await resolveRef({ fs, dir: '/tutorial', ref: 'main' })
 * console.log(sha)
 * const commit = await readCommit({ fs, dir: '/tutorial', oid: sha })
 * console.log(commit)
 *
 */
export async function readCommit({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  oid,
  cache = {},
}: ReadCommitParams): Promise<ReadCommitResult> {
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
