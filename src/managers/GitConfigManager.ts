import { FileSystem } from '../models/FileSystem'
import { GitConfig } from '../models/GitConfig'

/** @internal */
export class GitConfigManager {
  static async get({ fs, gitdir }: { fs: FileSystem, gitdir: string }) {
    // We can improve efficiency later if needed.
    // TODO: read from full list of git config files
    const text = await fs.read(`${gitdir}/config`, { encoding: 'utf8' })
    return GitConfig.from(text as string)
  }

  static async save({ fs, gitdir, config }: { fs: FileSystem, gitdir: string, config: GitConfig }) {
    // We can improve efficiency later if needed.
    // TODO: handle saving to the correct global/user/repo location
    await fs.write(`${gitdir}/config`, config.toString(), {
      encoding: 'utf8',
    })
  }
}
