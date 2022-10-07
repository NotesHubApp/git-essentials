import { _merge } from '../commands/merge'
import { MissingNameError } from '../errors'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { Author, SignCallback, Cache, BlobMergeCallback } from '../models'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'
import { normalizeAuthorObject } from '../utils/normalizeAuthorObject'
import { normalizeCommitterObject } from '../utils/normalizeCommitterObject'


export type MergeParams = {
  /** A file system client. */
  fs: FsClient,

  /** A PGP signing implementation. */
  onSign?: SignCallback

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** The branch receiving the merge. If undefined, defaults to the current branch. */
  ours?: string

  /** The branch to be merged. */
  theirs: string

  /** If false, create a merge commit in all cases (default: `true`). */
  fastForward?: boolean

  /** If true, then non-fast-forward merges will throw an Error instead of performing a merge. */
  fastForwardOnly?: boolean

  /** If true, simulates a merge so you can test whether it would succeed. */
  dryRun?: boolean

  /** If true, does not update the branch pointer after creating the commit. */
  noUpdateBranch?: boolean

  /** Overrides the default auto-generated merge commit message. */
  message?: string

  /** Passed to commit when creating a merge commit. */
  author?: Author

  /** Passed to commit when creating a merge commit. */
  committer?: Author

  /** Passed to commit when creating a merge commit. */
  signingKey?: string

  /** Optional blob merge callback. */
  onBlobMerge?: BlobMergeCallback

  /** A cache object. */
  cache?: Cache
}

export type MergeResult = {
  /** The SHA-1 object id that is now at the head of the branch. Absent only if `dryRun` was specified and `mergeCommit` is true. */
  oid?: string

  /** True if the branch was already merged so no changes were made. */
  alreadyMerged?: boolean

  /** True if it was a fast-forward merge. */
  fastForward?: boolean

  /** True if merge resulted in a merge commit. */
  mergeCommit?: boolean

  /** The SHA-1 object id of the tree resulting from a merge commit. */
  tree?: string
}

/**
 * Merge two branches.
 *
 * ## Limitations
 *
 * Currently it does not support incomplete merges. That is, if there are merge conflicts it cannot solve
 * with the built in diff3 algorithm it will not modify the working dir, and will throw a {@link Errors.MergeNotSupportedError} error.
 *
 * Currently it will fail if multiple candidate merge bases are found. (It doesn't yet implement the recursive merge strategy.)
 *
 * You can use {@link BlobMergeCallback onBlobMerge} callback to define your own merge stragegy.
 *
 * @param args
 *
 * @returns Resolves to a description of the merge operation
 *
 * @example
 * const m = await merge({
 *   fs,
 *   dir: '/tutorial',
 *   ours: 'main',
 *   theirs: 'remotes/origin/main'
 * })
 * console.log(m)
 *
 */
export async function merge({
  fs: _fs,
  onSign,
  dir,
  gitdir = join(dir, '.git'),
  ours,
  theirs,
  fastForward = true,
  fastForwardOnly = false,
  dryRun = false,
  noUpdateBranch = false,
  message,
  author: _author,
  committer: _committer,
  signingKey,
  onBlobMerge,
  cache = {},
}: MergeParams): Promise<MergeResult> {
  try {
    assertParameter('fs', _fs)
    if (signingKey) {
      assertParameter('onSign', onSign)
    }
    const fs = new FileSystem(_fs)

    const author = await normalizeAuthorObject({ fs, gitdir, author: _author })
    if (!author && (!fastForwardOnly || !fastForward)) {
      throw new MissingNameError('author')
    }

    const committer = await normalizeCommitterObject({
      fs,
      gitdir,
      author: author!,
      committer: _committer,
    })

    if (!committer && (!fastForwardOnly || !fastForward)) {
      throw new MissingNameError('committer')
    }

    return await _merge({
      fs,
      cache,
      dir,
      gitdir,
      ours,
      theirs,
      fastForward,
      fastForwardOnly,
      dryRun,
      noUpdateBranch,
      message,
      author: author!,
      committer,
      signingKey,
      onSign,
      onBlobMerge,
    })
  } catch (err: any) {
    err.caller = 'git.merge'
    throw err
  }
}
