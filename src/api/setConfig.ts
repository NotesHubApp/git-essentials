import { GitConfigManager } from '../managers/GitConfigManager'
import { ConfigPath, ConfigValue } from '../models'
import { FileSystem } from '../models/FileSystem'
import { FsClient } from '../models/FsClient'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


type SetConfigParams<T> = {
  /** A file system implementation. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string

  /** The key of the git config entry. */
  path: T

  /** A value to store at that path (use `undefined` as the value to delete a config entry). */
  value: ConfigValue<T> | undefined

  /** If true, will append rather than replace when setting (use with multi-valued config options). */
  append?: boolean
}

/**
 * Write an entry to the git config files.
 *
 * *Caveats:*
 * - Currently only the local `$GIT_DIR/config` file can be read or written. However support for the global `~/.gitconfig` and system `$(prefix)/etc/gitconfig` will be added in the future.
 * - The current parser does not support the more exotic features of the git-config file format such as `[include]` and `[includeIf]`.
 *
 * @param {SetConfigParams} args
 *
 * @returns {Promise<void>} Resolves successfully when operation completed
 *
 * @example
 * // Write config value
 * await git.setConfig({
 *   fs,
 *   dir: '/tutorial',
 *   path: 'user.name',
 *   value: 'Mr. Test'
 * })
 *
 * // Print out config file
 * let file = await fs.promises.readFile('/tutorial/.git/config', 'utf8')
 * console.log(file)
 *
 * // Delete a config entry
 * await git.setConfig({
 *   fs,
 *   dir: '/tutorial',
 *   path: 'user.name',
 *   value: undefined
 * })
 *
 * // Print out config file
 * file = await fs.promises.readFile('/tutorial/.git/config', 'utf8')
 * console.log(file)
 */
export async function setConfig<T extends ConfigPath>({
  fs: _fs,
  dir,
  gitdir = join(dir, '.git'),
  path,
  value,
  append = false,
}: SetConfigParams<T>): Promise<void> {
  try {
    assertParameter('fs', _fs)
    assertParameter('gitdir', gitdir)
    assertParameter('path', path)

    const fs = new FileSystem(_fs)
    const config = await GitConfigManager.get({ fs, gitdir })
    if (append) {
      config.append(path, value)
    } else {
      config.set(path, value)
    }
    await GitConfigManager.save({ fs, gitdir, config })
  } catch (err: any) {
    err.caller = 'git.setConfig'
    throw err
  }
}
