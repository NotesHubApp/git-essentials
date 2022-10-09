import { NormalizedStats } from './NormalizedStats'

/** @internal */
export type IndexEntryFlags = {
  assumeValid: boolean
  extended: boolean
  stage: number
  nameLength: number
}

/** @internal */
export type IndexEntry = NormalizedStats & {
  oid: string
  path: string
  flags: IndexEntryFlags
}
