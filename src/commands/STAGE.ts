import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { GitWalkerIndex } from '../models/GitWalkerIndex'
import { Walker, GitWalkSymbol } from '../models/Walker'

/**
 * @returns {Walker}
 */
export function STAGE(): Walker {
  const o = Object.create(null)
  Object.defineProperty(o, GitWalkSymbol, {
    value: function({ fs, gitdir, cache }: { fs: FileSystem, gitdir: string, cache: Cache }) {
      return new GitWalkerIndex({ fs, gitdir, cache })
    },
  })
  Object.freeze(o)
  return o
}
