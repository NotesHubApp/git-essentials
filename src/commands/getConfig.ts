import { FileSystem } from '../models/FileSystem'
import { GitConfigManager } from '../managers/GitConfigManager'

type GetConfigParams = {
  fs: FileSystem
  gitdir: string
  path: string
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
export async function _getConfig({ fs, gitdir, path }: GetConfigParams) {
  const config = await GitConfigManager.get({ fs, gitdir })
  return config.get(path)
}
