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
 * @group Cache
 */
export type Cache = {
  [IndexCache]?: { map: Map<string, GitIndex>, stats: Map<string, Stats | null>}
  [PackfileCache]?: Map<string, Promise<GitPackIndex | undefined>>
}
