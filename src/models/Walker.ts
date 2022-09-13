import { FileSystem } from './FileSystem'
import { Cache } from './Cache'
import { Stat } from './FsClient'

// This is part of an elaborate system to facilitate code-splitting / tree-shaking.
// commands/walk.js can depend on only this, and the actual Walker classes exported
// can be opaque - only having a single property (this symbol) that is not enumerable,
// and thus the constructor can be passed as an argument to walk while being "unusable"
// outside of it.
export const GitWalkSymbol = Symbol('GitWalkSymbol')

export interface GitWalkder {
  readonly ConstructEntry: WalkerEntryConstructor
  readdir(entry: WalkerEntryInternal): Promise<string[] | null>
}

type WalkerParams = { fs: FileSystem, dir: string, gitdir: string, cache: Cache }
export type Walker = { [GitWalkSymbol]: (args: WalkerParams) => GitWalkder }

export type WalkerEntryType = 'blob' | 'tree' | 'commit' | 'special'
export type WalkerEntryConstructor = new(fullpath: string) => WalkerEntryInternal

export interface WalkerEntryInternal {
  _fullpath: string
  _type: boolean | WalkerEntryType
  _mode: boolean | number
  _stat: boolean | Stat | undefined
  _content: boolean | Uint8Array | undefined
  _oid: boolean | string
  _actualSize: number | undefined

  type(): Promise<WalkerEntryType>
  mode(): Promise<number>
  stat(): Promise<void | Stat | undefined>
  content(): Promise<void | Uint8Array | undefined>
  oid(): Promise<string>
}

