import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { ReadCommitResult, _readCommit } from '../commands/readCommit'
import { GitRefManager } from '../managers/GitRefManager'
import { GitShallowManager } from '../managers/GitShallowManager'
import { compareAge } from '../utils/compareAge'

type LogParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  ref: string
  depth?: number
  since?: Date
}

/**
 * Get commit descriptions from the git history
 *
 * @param {object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {any} args.cache
 * @param {string} args.gitdir
 * @param {string} args.ref
 * @param {number|void} args.depth
 * @param {Date|void} args.since
 *
 * @returns {Promise<Array<ReadCommitResult>>}
 */
export async function _log({ fs, cache, gitdir, ref, depth, since }: LogParams): Promise<Array<ReadCommitResult>> {
  const sinceTimestamp =
    typeof since === 'undefined'
      ? undefined
      : Math.floor(since.valueOf() / 1000)
  // TODO: In the future, we may want to have an API where we return a
  // async iterator that emits commits.
  const commits = []
  const shallowCommits = await GitShallowManager.read({ fs, gitdir })
  const oid = await GitRefManager.resolve({ fs, gitdir, ref })
  const tips = [await _readCommit({ fs, cache, gitdir, oid })]

  while (true) {
    const commit = tips.pop()!

    // Stop the log if we've hit the age limit
    if (
      sinceTimestamp !== undefined &&
      commit.commit.committer.timestamp <= sinceTimestamp
    ) {
      break
    }

    commits.push(commit)

    // Stop the loop if we have enough commits now.
    if (depth !== undefined && commits.length === depth) break

    // If this is not a shallow commit...
    if (!shallowCommits.has(commit.oid)) {
      // Add the parents of this commit to the queue
      // Note: for the case of a commit with no parents, it will concat an empty array, having no net effect.
      for (const oid of commit.commit.parent!) {
        const commit = await _readCommit({ fs, cache, gitdir, oid })
        if (!tips.map(commit => commit.oid).includes(commit.oid)) {
          tips.push(commit)
        }
      }
    }

    // Stop the loop if there are no more commit parents
    if (tips.length === 0) break

    // Process tips in order by age
    tips.sort((a, b) => compareAge(a.commit, b.commit))
  }
  return commits
}
