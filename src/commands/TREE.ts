import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { GitWalkerRepo } from '../models/GitWalkerRepo'
import { Walker, GitWalkSymbol } from '../models/Walker'


/**
 * @param {object} args
 * @param {string} [args.ref='HEAD']
 * @returns {Walker}
 */
export function TREE({ ref = 'HEAD' }: { ref?: string } = {}): Walker {
  const o = Object.create(null)
  Object.defineProperty(o, GitWalkSymbol, {
    value: function({ fs, gitdir, cache }: { fs: FileSystem, gitdir: string, cache: Cache }) {
      return new GitWalkerRepo({ fs, gitdir, ref, cache })
    },
  })
  Object.freeze(o)
  return o
}
