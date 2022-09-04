import { GitIndex } from './GitIndex'
import { StatLike } from './IBackend'

export const IndexCache = Symbol('IndexCache')

export type Cache = {
  [IndexCache]?: IndexCacheObject
}

export type IndexCacheObject = {
  map: Map<string, GitIndex>
  stats: Map<string, StatLike>
}
