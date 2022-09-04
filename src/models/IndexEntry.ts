import { NormalizedStat } from './NormalizedStat'

export type IndexEntryFlags = {
  assumeValid: boolean
  extended: boolean
  stage: number
  nameLength: number
}

export type IndexEntry = NormalizedStat & {
  oid: string
  path: string
  flags: IndexEntryFlags
}
