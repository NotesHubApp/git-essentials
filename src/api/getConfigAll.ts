import { _getConfigAll } from '../commands/getConfigAll'
import { FileSystem } from '../models/FileSystem'
import { IBackend } from '../models/IBackend'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'

type GetConfigAllParams = {
  fs: IBackend
  dir: string
  gitdir?: string
  path: string
}

/**
 * Read a multi-valued entry from the git config files.
 *
 * *Caveats:*
 * - Currently only the local `$GIT_DIR/config` file can be read or written. However support for the global `~/.gitconfig` and system `$(prefix)/etc/gitconfig` will be added in the future.
 * - The current parser does not support the more exotic features of the git-config file format such as `[include]` and `[includeIf]`.
 *
 * @param {Object} args
 * @param {FsClient} args.fs - a file system implementation
 * @param {string} [args.dir] - The [working tree](dir-vs-gitdir.md) directory path
 * @param {string} [args.gitdir=join(dir,'.git')] - [required] The [git directory](dir-vs-gitdir.md) path
 * @param {string} args.path - The key of the git config entry
 *
 * @returns {Promise<Array<any>>} Resolves with the config value
 *
 */
export async function getConfigAll({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  path,
}: GetConfigAllParams) {
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
