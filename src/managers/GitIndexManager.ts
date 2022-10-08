import AsyncLock from 'async-lock'

import { Cache, IndexCache } from '../models/Cache'
import { FileSystem } from '../models/FileSystem'
import { GitIndex } from '../models/GitIndex'
import { Stats, StatsLike } from '../models/FsClient'
import { compareStats } from '../utils/compareStats'


type IndexCacheObject = {
  map: Map<string, object>
  stats: Map<string, Stats | null>
}

let lock: AsyncLock | null = null

function createCache() {
  return {
    map: new Map<string, GitIndex>(),
    stats: new Map<string, StatsLike>(),
  }
}

async function updateCachedIndexFile(fs: FileSystem, filepath: string, cache: IndexCacheObject) {
  const stat = await fs.lstat(filepath)
  const rawIndexFile = (await fs.read(filepath)) as Buffer
  const index = await GitIndex.from(rawIndexFile)
  // cache the GitIndex object so we don't need to re-read it every time.
  cache.map.set(filepath, index)
  // Save the stat data for the index so we know whether the cached file is stale (modified by an outside process).
  cache.stats.set(filepath, stat)
}

// Determine whether our copy of the index file is stale
async function isIndexStale(fs: FileSystem, filepath: string, cache: IndexCacheObject) {
  const savedStats = cache.stats.get(filepath)
  if (savedStats === undefined) return true
  const currStats = await fs.lstat(filepath)
  if (savedStats === null) return false
  if (currStats === null) return false
  return compareStats(savedStats, currStats)
}

/** @internal */
export class GitIndexManager {
  static async acquire<T>(
    { fs, gitdir, cache }: { fs: FileSystem, gitdir: string, cache: Cache },
    closure: (index: GitIndex) => Promise<T>) {
    if (!cache[IndexCache]) cache[IndexCache] = createCache()
    const indexCache = cache[IndexCache]

    const filepath = `${gitdir}/index`
    if (lock === null) lock = new AsyncLock({ maxPending: Infinity })
    let result: T
    await lock.acquire(filepath, async function() {
      // Acquire a file lock while we're reading the index
      // to make sure other processes aren't writing to it
      // simultaneously, which could result in a corrupted index.
      // const fileLock = await Lock(filepath)
      if (await isIndexStale(fs, filepath, indexCache)) {
        await updateCachedIndexFile(fs, filepath, indexCache)
      }
      const index = <GitIndex>indexCache.map.get(filepath)!
      result = await closure(index)
      if (index._dirty) {
        // Acquire a file lock while we're writing the index file
        // let fileLock = await Lock(filepath)
        const buffer = await index.toObject()
        await fs.write(filepath, buffer)
        // Update cached stat value
        indexCache.stats.set(filepath, (await fs.lstat(filepath))!)
        index._dirty = false
      }
    })
    return result!
  }
}
