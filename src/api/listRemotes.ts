import { _listRemotes } from '../commands/listRemotes'
import { FsClient } from '../models'
import { FileSystem } from '../models/FileSystem'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


type ListRemotesParams = {
  /** A file system client. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string
}

/**
 * List remotes.
 *
 * @param {ListRemotesParams} args
 *
 * @returns {Promise<Array<{remote: string, url: string}>>} Resolves successfully with an array of `{remote, url}` objects
 *
 * @example
 * let remotes = await git.listRemotes({ fs, dir: '/tutorial' })
 * console.log(remotes)
 *
 */
export async function listRemotes(
  { fs, dir, gitdir = join(dir, '.git') }: ListRemotesParams): Promise<{ remote: string, url: string }[]> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)

    return await _listRemotes({
      fs: new FileSystem(fs),
      gitdir,
    })
  } catch (err: any) {
    err.caller = 'git.listRemotes'
    throw err
  }
}
