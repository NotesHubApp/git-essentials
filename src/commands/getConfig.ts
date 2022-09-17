import { FileSystem } from '../models/FileSystem'
import { GitConfigManager } from '../managers/GitConfigManager'
import { ConfigPath } from '../models'

type GetConfigParams<T> = {
  fs: FileSystem
  gitdir: string
  path: T
}

/**
 * @param {GetConfigParams} args
 *
 * @returns {Promise<any>} Resolves with the config value
 *
 * @example
 * // Read config value
 * let value = await git.getConfig({
 *   dir: '$input((/))',
 *   path: '$input((user.name))'
 * })
 * console.log(value)
 *
 */
export async function _getConfig<T extends ConfigPath>({ fs, gitdir, path }: GetConfigParams<T>) {
  const config = await GitConfigManager.get({ fs, gitdir })
  return config.get(path)
}
