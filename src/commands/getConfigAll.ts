import { FileSystem } from '../models/FileSystem'
import { GitConfigManager } from '../managers/GitConfigManager'

type GetConfigAllParams = {
  fs: FileSystem
  gitdir: string
  path: string
}

/**
 * @param {Object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {string} args.gitdir
 * @param {string} args.path
 *
 * @returns {Promise<Array<any>>} Resolves with an array of the config value
 *
 */
export async function _getConfigAll({ fs, gitdir, path }: GetConfigAllParams) {
  const config = await GitConfigManager.get({ fs, gitdir })
  return config.getall(path)
}
