import { Stat } from './FsClient'

type WalkerEntryType = 'blob' | 'tree' | 'commit' | 'special'

/**
 * The `WalkerEntry` is an interface that abstracts computing many common tree / blob stats.
 */
export type WalkerEntry = {
  content(): Promise<Uint8Array | void>
  type(): Promise<WalkerEntryType>
  mode(): Promise<number>
  oid(): Promise<string>
  stat(): Promise<Stat | undefined | void>
}
