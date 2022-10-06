import { _getConfig } from '../commands/getConfig'
import { ConfigPath, ConfigValue } from '../models'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


export type GetConfigParams<T> = {
  /** A file system implementation. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git'`). */
  gitdir?: string

  /** The key of the git config entry. */
  path: T
}

/**
 * Read an entry from the git config files.
 *
 * *Caveats:*
 * - Currently only the local `$GIT_DIR/config` file can be read or written. However support for the global `~/.gitconfig` and system `$(prefix)/etc/gitconfig` will be added in the future.
 * - The current parser does not support the more exotic features of the git-config file format such as `[include]` and `[includeIf]`.
 *
 * @param args
 *
 * @returns Resolves with the config value
 *
 * @example
 * // Read config value
 * const value = await getConfig({
 *   fs,
 *   dir: '/tutorial',
 *   path: 'remote.origin.url'
 * })
 * console.log(value)
 *
 */
export async function getConfig<T extends ConfigPath>({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  path
}: GetConfigParams<T>): Promise<ConfigValue<T> | undefined> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)
    assertParameter('path', path)

    return await _getConfig({
      fs: new FileSystem(fs),
      gitdir,
      path,
    })
  } catch (err: any) {
    err.caller = 'git.getConfig'
    throw err
  }
}
