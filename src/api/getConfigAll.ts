import { _getConfigAll } from '../commands/getConfigAll'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


export type GetConfigAllParams = {
  /** A file system implementation. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** The key of the git config entry. */
  path: string
}

/**
 * Read a multi-valued entry from the git config files.
 *
 * *Caveats:*
 * - Currently only the local `$GIT_DIR/config` file can be read or written. However support for the global `~/.gitconfig` and system `$(prefix)/etc/gitconfig` will be added in the future.
 * - The current parser does not support the more exotic features of the git-config file format such as `[include]` and `[includeIf]`.
 *
 * @param args
 *
 * @returns Resolves with the config value
 *
 */
export async function getConfigAll({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  path,
}: GetConfigAllParams): Promise<(string | undefined)[]> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)
    assertParameter('path', path)

    return await _getConfigAll({
      fs: new FileSystem(fs),
      gitdir,
      path,
    })
  } catch (err: any) {
    err.caller = 'git.getConfigAll'
    throw err
  }
}
