import { _commit } from '../commands/commit'
import { MissingNameError } from '../errors/MissingNameError'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { Author, SignCallback } from '../models'
import { Cache } from '../models/Cache'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'
import { normalizeAuthorObject } from '../utils/normalizeAuthorObject'
import { normalizeCommitterObject } from '../utils/normalizeCommitterObject'


export type CommitParams = {
  /** A file system implementation. */
  fs: FsClient,

  /** A PGP signing implementation. */
  onSign?: SignCallback

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** The commit message to use. */
  message: string

  /** The details about the author. */
  author?: Author,

  /** The details about the commit committer, in the same format as the author parameter. If not specified, the author details are used. */
  committer?: Author,

  /** Sign the tag object using this private PGP key. */
  signingKey?: string

  /** If true, simulates making a commit so you can test whether it would succeed. Implies `noUpdateBranch`. */
  dryRun?: boolean

  /** If true, does not update the branch pointer after creating the commit. */
  noUpdateBranch?: boolean

  /** The fully expanded name of the branch to commit to. Default is the current branch pointed to by HEAD. (TODO: fix it so it can expand branch names without throwing if the branch doesn't exist yet). */
  ref?: string

  /** The SHA-1 object ids of the commits to use as parents. If not specified, the commit pointed to by `ref` is used. */
  parent?: string[]

  /** The SHA-1 object id of the tree to use. If not specified, a new tree object is created from the current git index. */
  tree?: string

  /** a cache object. */
  cache?: Cache
}

/**
 * Create a new commit.
 *
 * @param args
 *
 * @returns Resolves successfully with the SHA-1 object id of the newly created commit.
 *
 * @example
 * const sha = await commit({
 *   fs,
 *   dir: '/tutorial',
 *   author: {
 *     name: 'Mr. Test',
 *     email: 'mrtest@example.com',
 *   },
 *   message: 'Added the a.txt file'
 * })
 * console.log(sha)
 *
 * @group Commands
 */
export async function commit({
  fs: _fs,
  onSign,
  dir,
  gitdir = join(dir, '.git'),
  message,
  author: _author,
  committer: _committer,
  signingKey,
  dryRun = false,
  noUpdateBranch = false,
  ref,
  parent,
  tree,
  cache = {},
}: CommitParams): Promise<string> {
  try {
    assertParameter('fs', _fs)
    assertParameter('message', message)
    if (signingKey) {
      assertParameter('onSign', onSign)
    }
    const fs = new FileSystem(_fs)

    const author = await normalizeAuthorObject({ fs, gitdir, author: _author })
    if (!author) throw new MissingNameError('author')

    const committer = await normalizeCommitterObject({
      fs, gitdir, author, committer: _committer
    })
    if (!committer) throw new MissingNameError('committer')

    return await _commit({
      fs,
      cache,
      onSign,
      gitdir,
      message,
      author,
      committer,
      signingKey,
      dryRun,
      noUpdateBranch,
      ref,
      parent,
      tree,
    })
  } catch (err: any) {
    err.caller = 'git.commit'
    throw err
  }
}
