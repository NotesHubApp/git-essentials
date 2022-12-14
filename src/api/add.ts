import { Buffer } from 'buffer'

import { NotFoundError } from '../errors/NotFoundError'
import { GitIgnoreManager } from '../managers/GitIgnoreManager'
import { GitIndexManager } from '../managers/GitIndexManager'
import { FileSystem } from '../models/FileSystem'
import { GitIndex } from '../models/GitIndex'
import { FsClient } from '../models/FsClient'
import { Cache } from '../models/Cache'
import { _writeObject } from '../storage/writeObject'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


export type AddParams = {
  /** A file system implementation. */
  fs: FsClient

  /** A directory path. */
  dir: string

  /** The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** The path to the file to add to the index. */
  filepath: string

  /** Allow adding otherwise ignored files. */
  force?: boolean

  /** A cache object. */
  cache?: Cache
}

/**
 * Add a file to the git index (aka staging area).
 *
 * @param args
 *
 * @returns Resolves successfully once the git index has been updated.
 *
 * @example
 * ```ts
 * await fs.writeFile('/tutorial/README.md', '# TEST')
 * await add({ fs, dir: '/tutorial', filepath: 'README.md' })
 * ```
 *
 * @group Commands
 */
export async function add({
  fs: _fs,
  dir,
  gitdir = join(dir, '.git'),
  filepath,
  force = false,
  cache = {}
}: AddParams): Promise<void> {
  try {
    assertParameter('fs', _fs)
    assertParameter('dir', dir)
    assertParameter('gitdir', gitdir)
    assertParameter('filepath', filepath)

    const fs = new FileSystem(_fs)
    await GitIndexManager.acquire({ fs, gitdir, cache }, async function(index) {
      await addToIndex({ dir, gitdir, fs, filepath, index, force })
    })
  } catch (err: any) {
    err.caller = 'git.add'
    throw err
  }
}

async function addToIndex(
  { dir, gitdir, fs, filepath, index, force }:
  { dir: string, gitdir: string, fs: FileSystem, filepath: string, index: GitIndex, force: boolean }) {
  // TODO: Should ignore UNLESS it's already in the index.
  if (!force) {
    const ignored = await GitIgnoreManager.isIgnored({
      fs,
      dir,
      gitdir,
      filepath,
    })

    if (ignored) return
  }

  const stats = await fs.lstat(join(dir, filepath))

  if (!stats) throw new NotFoundError(filepath)

  if (stats.isDirectory()) {
    const children = await fs.readdir(join(dir, filepath))
    const promises = (children || []).map(child =>
      addToIndex({ dir, gitdir, fs, filepath: join(filepath, child), index, force })
    )

    await Promise.all(promises)
  } else {
    const object = stats.isSymbolicLink()
      ? await fs.readlink(join(dir, filepath))
      : (await fs.read(join(dir, filepath))) as Buffer

    if (object === null) throw new NotFoundError(filepath)

    const oid = await _writeObject({ fs, gitdir, type: 'blob', object })
    index.insert({ filepath, stats, oid })
  }
}
