import { Cache } from '../models/Cache'
import { GitIndexManager } from '../managers/GitIndexManager'
import { FileSystem } from '../models/FileSystem'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'
import { FsClient } from '../models/FsClient'


export type RemoveParams = {
  /** A file system client. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string

  /** The path to the file to remove from the index. */
  filepath: string

  /** A cache object. */
  cache?: Cache
}

/**
 * Remove a file from the git index (aka staging area).
 *
 * Note that this does NOT delete the file in the working directory.
 *
 * @param args
 *
 * @returns Resolves successfully once the git index has been updated
 *
 * @example
 * await remove({ fs, dir: '/tutorial', filepath: 'README.md' })
 *
 */
export async function remove({
  fs: _fs,
  dir,
  gitdir = join(dir, '.git'),
  filepath,
  cache = {},
}: RemoveParams): Promise<void> {
  try {
    assertParameter('fs', _fs)
    assertParameter('gitdir', gitdir)
    assertParameter('filepath', filepath)

    await GitIndexManager.acquire(
      { fs: new FileSystem(_fs), gitdir, cache },
      async function(index) {
        index.delete({ filepath })
      }
    )
  } catch (err: any) {
    err.caller = 'git.remove'
    throw err
  }
}
