import { FileSystem } from '../models/FileSystem'
import { BlobMergeCallback, Cache, NormalizedAuthor, SignCallback } from '../models'
import { _commit } from '../commands/commit'
import { _currentBranch } from '../commands/currentBranch'
import { _findMergeBase } from '../commands/findMergeBase'
import { FastForwardError } from '../errors/FastForwardError'
import { MergeNotSupportedError } from '../errors/MergeNotSupportedError'
import { GitRefManager } from '../managers/GitRefManager'
import { abbreviateRef } from '../utils/abbreviateRef'
import { mergeTree } from '../utils/mergeTree'


type MergeParams = {
  fs: FileSystem
  cache: Cache
  dir: string
  gitdir: string
  ours?: string
  theirs: string
  fastForwardOnly?: boolean
  dryRun: boolean
  noUpdateBranch: boolean
  message?: string
  author: NormalizedAuthor
  committer: NormalizedAuthor
  signingKey?: string
  onSign?: SignCallback
  onBlobMerge?: BlobMergeCallback
}

/**
 * @param {MergeParams} args
 *
 * @returns {Promise<MergeResult>} Resolves to a description of the merge operation
 *
 */
export async function _merge({
  fs,
  cache,
  dir,
  gitdir,
  ours,
  theirs,
  fastForwardOnly = false,
  dryRun = false,
  noUpdateBranch = false,
  message,
  author,
  committer,
  signingKey,
  onSign,
  onBlobMerge,
}: MergeParams) {
  if (ours === undefined) {
    ours = await _currentBranch({ fs, gitdir, fullname: true })
  }
  ours = await GitRefManager.expand({
    fs,
    gitdir,
    ref: ours!,
  })
  theirs = await GitRefManager.expand({
    fs,
    gitdir,
    ref: theirs,
  })
  const ourOid = await GitRefManager.resolve({
    fs,
    gitdir,
    ref: ours,
  })
  const theirOid = await GitRefManager.resolve({
    fs,
    gitdir,
    ref: theirs,
  })
  // find most recent common ancestor of ref a and ref b
  const baseOids = await _findMergeBase({
    fs,
    cache,
    gitdir,
    oids: [ourOid, theirOid],
  })
  if (baseOids.length !== 1) {
    throw new MergeNotSupportedError()
  }
  const baseOid = baseOids[0]
  // handle fast-forward case
  if (baseOid === theirOid) {
    return {
      oid: ourOid,
      alreadyMerged: true,
    }
  }
  if (baseOid === ourOid) {
    if (!dryRun && !noUpdateBranch) {
      await GitRefManager.writeRef({ fs, gitdir, ref: ours, value: theirOid })
    }
    return {
      oid: theirOid,
      fastForward: true,
    }
  } else {
    // not a simple fast-forward
    if (fastForwardOnly) {
      throw new FastForwardError()
    }
    // try a fancier merge
    const tree = await mergeTree({
      fs,
      cache,
      dir,
      gitdir,
      ourOid,
      theirOid,
      baseOid,
      ourName: ours,
      baseName: 'base',
      theirName: theirs,
      dryRun,
      onBlobMerge,
    })
    if (!message) {
      message = `Merge branch '${abbreviateRef(theirs)}' into ${abbreviateRef(ours)}`
    }
    const oid = await _commit({
      fs,
      cache,
      gitdir,
      message,
      ref: ours,
      tree,
      parent: [ourOid, theirOid],
      author,
      committer,
      signingKey,
      onSign,
      dryRun,
      noUpdateBranch,
    })
    return {
      oid,
      tree,
      mergeCommit: true,
    }
  }
}
