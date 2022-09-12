import { _log } from '../commands/log'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { Cache } from '../models/Cache'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'
import { ReadCommitResult } from '../commands/readCommit'

type LogParams = {
  fs: FsClient
  dir: string
  gitdir?: string
  ref?: string
  depth?: number
  since?: Date
  cache?: Cache
}

/**
 * Get commit descriptions from the git history
 *
 * @param {object} args
 * @param {FsClient} args.fs - a file system client
 * @param {string} [args.dir] - The [working tree](dir-vs-gitdir.md) directory path
 * @param {string} [args.gitdir=join(dir,'.git')] - [required] The [git directory](dir-vs-gitdir.md) path
 * @param {string} [args.ref = 'HEAD'] - The commit to begin walking backwards through the history from
 * @param {number} [args.depth] - Limit the number of commits returned. No limit by default.
 * @param {Date} [args.since] - Return history newer than the given date. Can be combined with `depth` to get whichever is shorter.
 * @param {object} [args.cache] - a [cache](cache.md) object
 *
 * @returns {Promise<Array<ReadCommitResult>>} Resolves to an array of ReadCommitResult objects
 * @see ReadCommitResult
 * @see CommitObject
 *
 * @example
 * let commits = await git.log({
 *   fs,
 *   dir: '/tutorial',
 *   depth: 5,
 *   ref: 'main'
 * })
 * console.log(commits)
 *
 */
export async function log({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  ref = 'HEAD',
  depth,
  since, // Date
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
    })
  } catch (err: any) {
    err.caller = 'git.log'
    throw err
  }
}
