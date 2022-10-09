import { _addRemote } from '../commands/addRemote'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


export type AddRemoteParams = {
  /** A file system implementation. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /**  The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** The name of the remote. */
  remote: string

  /** The URL of the remote. */
  url: string

  /** Instead of throwing an error if a remote named `remote` already exists, overwrite the existing remote. */
  force?: boolean
}

/**
 * Add or update a remote.
 *
 * @param args
 *
 * @returns Resolves successfully when filesystem operations are complete.
 *
 * @example
 * await addRemote({
 *   fs,
 *   dir: '/tutorial',
 *   remote: 'upstream',
 *   url: 'https://github.com/NotesHubApp/git-essentials'
 * })
 *
 * @group Commands
 */
export async function addRemote({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  remote,
  url,
  force = false,
}: AddRemoteParams): Promise<void> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)
    assertParameter('remote', remote)
    assertParameter('url', url)
    return await _addRemote({
      fs: new FileSystem(fs),
      gitdir,
      remote,
      url,
      force,
    })
  } catch (err: any) {
    err.caller = 'git.addRemote'
    throw err
  }
}
