import { GitIndex } from './GitIndex'
import { GitPackIndex } from './GitPackIndex'
import { StatLike } from './IBackend'

export const IndexCache = Symbol('IndexCache')
export const PackfileCache = Symbol('PackfileCache')

export type Cache = {
  [IndexCache]?: IndexCacheObject
  [PackfileCache]?: Map<string, Promise<GitPackIndex | undefined>>
}

export type IndexCacheObject = {
  map: Map<string, GitIndex>
  stats: Map<string, StatLike>
}
