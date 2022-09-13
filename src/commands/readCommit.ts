import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { resolveCommit } from '../utils/resolveCommit'
import { Commit } from '../models/GitCommit'

type ReadCommitParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  oid: string
}

export type ReadCommitResult = {
  oid: string
  commit: Commit
  payload: string
}

/**
 * @param {object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {any} args.cache
 * @param {string} args.gitdir
 * @param {string} args.oid
 *
 * @returns {Promise<ReadCommitResult>} Resolves successfully with a git commit object
 * @see ReadCommitResult
 * @see CommitObject
 *
 */
export async function _readCommit({ fs, cache, gitdir, oid }: ReadCommitParams): Promise<ReadCommitResult> {
  const { commit, oid: commitOid } = await resolveCommit({ fs, cache, gitdir, oid })

  const result = {
    oid: commitOid,
    commit: commit.parse(),
    payload: commit.withoutSignature(),
  }

  return result
}
