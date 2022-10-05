import { Stat } from './FsClient'

export const IndexCache = Symbol('IndexCache')
export const PackfileCache = Symbol('PackfileCache')

export type GitPackIndex = object
export type GitIndex = object

export type Cache = {
  [IndexCache]?: { map: Map<string, GitIndex>, stats: Map<string, Stat | null>}
  [PackfileCache]?: Map<string, Promise<GitPackIndex | undefined>>
}
