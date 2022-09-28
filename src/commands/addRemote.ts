import cleanGitRef from 'clean-git-ref'

import { FileSystem } from '../models/FileSystem'
import { AlreadyExistsError } from '../errors/AlreadyExistsError'
import { InvalidRefNameError } from '../errors/InvalidRefNameError'
import { GitConfigManager } from '../managers/GitConfigManager'

type AddRemoteParams = {
  fs: FileSystem
  gitdir: string
  remote: string
  url: string
  force: boolean
}

/**
 * @param {AddRemoteParams} args
 *
 * @returns {Promise<void>}
 *
 */
export async function _addRemote({ fs, gitdir, remote, url, force }: AddRemoteParams): Promise<void> {
  if (remote !== cleanGitRef.clean(remote)) {
    throw new InvalidRefNameError(remote, cleanGitRef.clean(remote))
  }
  const config = await GitConfigManager.get({ fs, gitdir })
  if (!force) {
    // Check that setting it wouldn't overwrite.
    const remoteNames = config.getSubsections('remote')
    if (remoteNames.includes(remote)) {
      // Throw an error if it would overwrite an existing remote,
      // but not if it's simply setting the same value again.
      if (url !== config.get(`remote.${remote}.url`)) {
        throw new AlreadyExistsError('remote', remote)
      }
    }
  }
  config.set(`remote.${remote}.url`, url)
  config.set(
    `remote.${remote}.fetch`,
    `+refs/heads/*:refs/remotes/${remote}/*`
  )
  await GitConfigManager.save({ fs, gitdir, config })
}
