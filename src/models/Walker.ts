import { FileSystem } from './FileSystem'
import { Cache } from './Cache'
import { Stat } from './FsClient'


export type WalkerEntryType = 'blob' | 'tree' | 'commit' | 'special'

/**
 * The `WalkerEntry` is an interface that abstracts computing many common tree / blob stats.
 */
 export interface WalkerEntry {
  content(): Promise<Uint8Array | undefined>
  type(): Promise<WalkerEntryType>
  mode(): Promise<number>
  oid(): Promise<string>
  stat(): Promise<Stat | undefined>
}

/** @internal */
export interface WalkerEntryInternal extends WalkerEntry {
  _fullpath: string
  _type: boolean | WalkerEntryType
  _mode: boolean | number
  _stat: boolean | Stat | undefined
  _content: boolean | Uint8Array | undefined
  _oid: boolean | string
  _actualSize: number | undefined
}

/**
 * This is part of an elaborate system to facilitate code-splitting / tree-shaking.
 * commands/walk.ts can depend on only this, and the actual Walker classes exported
 * can be opaque - only having a single property (this symbol) that is not enumerable,
 * and thus the constructor can be passed as an argument to walk while being "unusable"
 * outside of it.
 *
 * @internal
 */
export const GitWalkSymbol = Symbol('GitWalkSymbol')

/** @internal */
export interface GitWalker {
  readonly ConstructEntry: WalkerEntryConstructor
  readdir(entry: WalkerEntryInternal): Promise<string[] | null>
}

type WalkerParams = { fs: FileSystem, dir: string, gitdir: string, cache: Cache }

/** @internal */
export type Walker = { [GitWalkSymbol]: (args: WalkerParams) => GitWalker }

/** @internal */
export type WalkerEntryConstructor = new(fullpath: string) => WalkerEntryInternal


