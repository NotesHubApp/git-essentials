import { FileSystem } from '../models/FileSystem'
import { GitConfigManager } from '../managers/GitConfigManager'
import { ConfigPath } from '../models'

type GetConfigAllParams<T> = {
  fs: FileSystem
  gitdir: string
  path: T
}

/**
 * @param {GetConfigAllParams} args
 *
 * @returns {Promise<Array<any>>} Resolves with an array of the config value
 *
 */
export async function _getConfigAll<T extends ConfigPath>({ fs, gitdir, path }: GetConfigAllParams<T>) {
  const config = await GitConfigManager.get({ fs, gitdir })
  return config.getall(path)
}
