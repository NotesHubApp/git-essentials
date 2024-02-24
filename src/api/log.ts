import { Cache } from '../models/Cache'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { ReadCommitResult } from '../api/readCommit'
import { _log } from '../commands/log'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'

export type LogParams = {
  /** A file system client. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** The commit to begin walking backwards through the history from (default: `HEAD`). */
  ref?: string

  /** Limit the number of commits returned. No limit by default. */
  depth?: number

  /** Return history newer than the given date. Can be combined with `depth` to get whichever is shorter. */
  since?: Date

  /** Get the commit for the filepath only. */
  filepath?: string

  /** Do not throw error if filepath does not exist (works only for a single file, default: `false`). */
  force?: boolean

  /** Continue listing the history of a file beyond renames (works only for a single file, default: `false`). */
  follow?: boolean

  /** A cache object. */
  cache?: Cache
}

/**
 * Get commit descriptions from the git history.
 *
 * @param args
 *
 * @returns Resolves to an array of {@link ReadCommitResult} objects.
 *
 * @example
 * const commits = await log({
 *   fs,
 *   dir: '/tutorial',
 *   depth: 5,
 *   ref: 'main'
 * })
 * console.log(commits)
 *
 * @group Commands
 */
export async function log({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  ref = 'HEAD',
  depth,
  since, // Date
  filepath,
  force = false,
  follow = false,
  cache = {},
}: LogParams): Promise<Array<ReadCommitResult>> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)
    assertParameter('ref', ref)

    return await _log({
      fs: new FileSystem(fs),
      cache,
      gitdir,
      ref,
      depth,
      since,
      filepath,
      force,
      follow
    })
  } catch (err: any) {
    err.caller = 'git.log'
    throw err
  }
}
