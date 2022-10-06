import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { GitWalkerFs } from '../models/GitWalkerFs'
import { GitWalkSymbol, Walker } from '../models/Walker'


/** @internal */
export function WORKDIR(): Walker {
  const o = Object.create(null)
  Object.defineProperty(o, GitWalkSymbol, {
    value: function(
      { fs, dir, gitdir, cache }:
      { fs: FileSystem, dir: string, gitdir: string, cache: Cache }) {
      return new GitWalkerFs({ fs, dir, gitdir, cache })
    },
  })
  Object.freeze(o)
  return o
}
