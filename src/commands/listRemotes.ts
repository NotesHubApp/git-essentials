import { FileSystem } from '../models/FileSystem'
import { GitConfigManager } from '../managers/GitConfigManager'

type ListRemotesParams = {
  fs: FileSystem,
  gitdir: string
}

/** @internal */
export async function _listRemotes({ fs, gitdir }: ListRemotesParams): Promise<{ remote: string, url: string }[]> {
  const config = await GitConfigManager.get({ fs, gitdir })
  const remoteNames = await config.getSubsections('remote')
  const remotes = Promise.all(
    remoteNames.map(async remote => {
      const url = config.get(`remote.${remote}.url`)!
      return { remote: remote!, url }
    })
  )
  return remotes
}
