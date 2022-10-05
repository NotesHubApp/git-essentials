import { FileSystem } from '../models/FileSystem'
import { join } from '../utils/join'

type InitParams = {
  fs: FileSystem
  bare?: boolean
  dir: string
  gitdir?: string
  defaultBranch?: string
}

/**
 * Initialize a new repository
 *
 * @param {InitParams} args
 * @internal
 */
export async function _init({
  fs,
  bare = false,
  dir,
  gitdir = bare ? dir : join(dir, '.git'),
  defaultBranch = 'main',
}: InitParams): Promise<void> {
  // Don't overwrite an existing config
  if (await fs.exists(gitdir + '/config')) return

  let folders = [
    'hooks',
    'info',
    'objects/info',
    'objects/pack',
    'refs/heads',
    'refs/tags',
  ]
  folders = folders.map(dir => gitdir + '/' + dir)
  for (const folder of folders) {
    await fs.mkdir(folder)
  }

  await fs.write(
    gitdir + '/config',
    '[core]\n' +
      '\trepositoryformatversion = 0\n' +
      '\tfilemode = false\n' +
      `\tbare = ${bare}\n` +
      (bare ? '' : '\tlogallrefupdates = true\n') +
      '\tsymlinks = false\n' +
      '\tignorecase = true\n'
  )
  await fs.write(gitdir + '/HEAD', `ref: refs/heads/${defaultBranch}\n`)
}
