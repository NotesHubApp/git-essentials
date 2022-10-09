import { _init } from '../commands/init'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


export type InitParams = {
  /** A file system client. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir,'.git')`). */
  gitdir?: string

  /** Initialize a bare repository. */
  bare?: boolean

  /** The name of the default branch (default: `main`). */
  defaultBranch?: string
}

/**
 * Initialize a new repository.
 *
 * @param args
 * @returns Resolves successfully when filesystem operations are complete.
 *
 * @example
 * await init({ fs, dir: '/tutorial' })
 *
 * @group Commands
 */
export async function init({
  fs,
  bare = false,
  dir,
  gitdir = bare ? dir : join(dir, '.git'),
  defaultBranch = 'main',
}: InitParams): Promise<void> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)
    if (!bare) {
      assertParameter('dir', dir)
    }

    return await _init({
      fs: new FileSystem(fs),
      bare,
      dir,
      gitdir,
      defaultBranch
    })
  } catch (err: any) {
    err.caller = 'git.init'
    throw err
  }
}
