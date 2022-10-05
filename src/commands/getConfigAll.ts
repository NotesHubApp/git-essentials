import { FileSystem } from '../models/FileSystem'
import { GitConfigManager } from '../managers/GitConfigManager'
import { ConfigPath } from '../models'

type GetConfigAllParams<T> = {
  fs: FileSystem
  gitdir: string
  path: T
}

/** @internal */
export async function _getConfigAll<T extends ConfigPath>({ fs, gitdir, path }: GetConfigAllParams<T>) {
  const config = await GitConfigManager.get({ fs, gitdir })
  return config.getall(path)
}
