import AsyncLock from 'async-lock'

import { FileSystem } from '../models/FileSystem'
import { join } from '../utils/join'

let lock: AsyncLock | null = null

/** @internal */
export class GitShallowManager {
  static async read({ fs, gitdir }: { fs: FileSystem, gitdir: string }) {
    if (lock === null) lock = new AsyncLock()
    const filepath = join(gitdir, 'shallow')
    const oids = new Set<string>()

    await lock.acquire(filepath, async function() {
      const text = (await fs.read(filepath, { encoding: 'utf8' })) as string
      if (text === null) return oids // no file
      if (text.trim() === '') return oids // empty file
      text
        .trim()
        .split('\n')
        .map(oid => oids.add(oid))
    })
    return oids
  }

  static async write({ fs, gitdir, oids }: { fs: FileSystem, gitdir: string, oids: Set<string> }) {
    if (lock === null) lock = new AsyncLock()
    const filepath = join(gitdir, 'shallow')
    if (oids.size > 0) {
      const text = [...oids].join('\n') + '\n'
      await lock.acquire(filepath, async function() {
        await fs.write(filepath, text, {
          encoding: 'utf8',
        })
      })
    } else {
      // No shallows
      await lock.acquire(filepath, async function() {
        await fs.rm(filepath)
      })
    }
  }
}
