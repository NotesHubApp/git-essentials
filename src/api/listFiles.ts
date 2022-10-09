import { Cache } from '../models/Cache'
import { _listFiles } from '../commands/listFiles'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


export type ListFilesParams = {
  /** A file system client. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** Return a list of all the files in the commit at `ref` instead of the files currently in the git index (aka staging area). */
  ref?: string

  /** A cache object. */
  cache?: Cache
}

/**
 * List all the files in the git index or a commit.
 *
 * > Note: This function is efficient for listing the files in the staging area, but listing all the files in a commit requires recursively walking through the git object store.
 * > If you do not require a complete list of every file, better performance can be achieved by using [walk](./walk) and ignoring subdirectories you don't care about.
 *
 * @param args
 *
 * @returns Resolves successfully with an array of filepaths.
 *
 * @example
 * // All the files in the previous commit
 * let files = await listFiles({ fs, dir: '/tutorial', ref: 'HEAD' })
 * console.log(files)
 * // All the files in the current staging area
 * files = await listFiles({ fs, dir: '/tutorial' })
 * console.log(files)
 *
 * @group Commands
 */
export async function listFiles({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  ref,
  cache = {},
}: ListFilesParams): Promise<string[]> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)

    return await _listFiles({
      fs: new FileSystem(fs),
      cache,
      gitdir,
      ref,
    })
  } catch (err: any) {
    err.caller = 'git.listFiles'
    throw err
  }
}
