import { Stats } from './FsClient'

/**
 * @group Cache
 */
export const IndexCache = Symbol('IndexCache')

/**
 * @group Cache
 */
export const PackfileCache = Symbol('PackfileCache')

/**
 * @group Cache
 */
export type GitPackIndex = object

/**
 * @group Cache
 */
export type GitIndex = object

/**
 * Some Git commands can greatly benefit from a cache.
 * Reading and parsing git packfiles (the files sent over the wire during `clone`, `fetch`, `pull` and `push`)
 * can take a "long" time for large git repositories.
 *
 * ### The `cache` parameter
 * Unlike canonical `git` commands however, there is a way for `git-essentials` commands
 * to cache intermediate results and re-use them between commands.
 *
 * There is no single best caching strategy:
 * - For long-running processes, you may want to monitor memory usage and
 * discard the cache when memory usage is above some threshold.
 * - For memory constrained devices, you may want to not use a cache at all.
 *
 * Instead of compromising, the library have placed a powerful tool in your hands:
 * 1. You pass in an ordinary `cache` object.
 * 2. the library stores data on it by setting Symbol properties.
 * 3. Manipulating the `cache` directly will void your warranty.
 * 4. To clear the cache, remove any references to it so it is garbage collected.
 *
 * @example
 * ```typescript
 * // PLEASE DON'T DO THIS!! This is for demonstration purposes only.
 * const test = async () => {
 *   console.time('time elapsed')
 *   let cache = {}
 *   for (const filepath of await listFiles({ fs, dir, cache })) {
 *     console.log(`${filepath}: ${await status({ fs, dir, filepath, cache })}`)
 *   }
 *   console.timeEnd('time elapsed')
 * }
 * test().catch(err => console.log(err))
 * ```
 *
 * The catch of course, is you have to decide when (if ever) to get rid of that cache.
 * It is just a JavaScript object, so all you need to do is eliminate any references to it and it will be garbage collected.
 *
 * ```typescript
 * // 1. Create a cache
 * let cache = {}
 * // 2. Do some stuff
 * // 3. Replace cache with new object so old cache is garbage collected
 * cache = {}
 * ```
 *
 * @group Cache
 */
export type Cache = {
  [IndexCache]?: { map: Map<string, GitIndex>, stats: Map<string, Stats | null>}
  [PackfileCache]?: Map<string, Promise<GitPackIndex | undefined>>
}
