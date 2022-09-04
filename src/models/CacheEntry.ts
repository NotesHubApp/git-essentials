import { NormalizedStat } from './NormalizedStat'

export type CacheEntryFlags = {
  assumeValid: boolean
  extended: boolean
  stage: number
  nameLength: number
}

export type CacheEntry = NormalizedStat & {
  oid: string
  path: string
  flags: CacheEntryFlags
}
