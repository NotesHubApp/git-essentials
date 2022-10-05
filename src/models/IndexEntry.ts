import { NormalizedStat } from './NormalizedStat'

/** @internal */
export type IndexEntryFlags = {
  assumeValid: boolean
  extended: boolean
  stage: number
  nameLength: number
}

/** @internal */
export type IndexEntry = NormalizedStat & {
  oid: string
  path: string
  flags: IndexEntryFlags
}
