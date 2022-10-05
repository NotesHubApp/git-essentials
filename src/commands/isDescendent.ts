import { FileSystem } from '../models/FileSystem'
import { MaxDepthError } from '../errors/MaxDepthError'
import { MissingParameterError } from '../errors/MissingParameterError'
import { ObjectTypeError } from '../errors/ObjectTypeError'
import { GitShallowManager } from '../managers/GitShallowManager'
import { GitCommit } from '../models/GitCommit'
import { _readObject } from '../storage/readObject'
import { Cache } from '../models'


type IsDescendentParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  oid: string
  ancestor: string
  /** Maximum depth to search before giving up. -1 means no maximum depth. */
  depth: number
}

/** @internal */
export async function _isDescendent({
  fs,
  cache,
  gitdir,
  oid,
  ancestor,
  depth,
}: IsDescendentParams): Promise<boolean> {
  const shallows = await GitShallowManager.read({ fs, gitdir })
  if (!oid) {
    throw new MissingParameterError('oid')
  }
  if (!ancestor) {
    throw new MissingParameterError('ancestor')
  }
  // If you don't like this behavior, add your own check.
  // Edge cases are hard to define a perfect solution.
  if (oid === ancestor) return false
  // We do not use recursion here, because that would lead to depth-first traversal,
  // and we want to maintain a breadth-first traversal to avoid hitting shallow clone depth cutoffs.
  const queue = [oid]
  const visited = new Set<string>()
  let searchdepth = 0
  while (queue.length) {
    if (searchdepth++ === depth) {
      throw new MaxDepthError(depth)
    }
    const oid = queue.shift()!
    const { type, object } = await _readObject({
      fs,
      cache,
      gitdir,
      oid,
    })
    if (type !== 'commit') {
      throw new ObjectTypeError(oid, type, 'commit')
    }
    const commit = GitCommit.from(object).parse()
    // Are any of the parents the sought-after ancestor?
    for (const parent of commit.parent) {
      if (parent === ancestor) return true
    }
    // If not, add them to heads (unless we know this is a shallow commit)
    if (!shallows.has(oid)) {
      for (const parent of commit.parent) {
        if (!visited.has(parent)) {
          queue.push(parent)
          visited.add(parent)
        }
      }
    }
    // Eventually, we'll travel entire tree to the roots where all the parents are empty arrays,
    // or hit the shallow depth and throw an error. Excluding the possibility of grafts, or
    // different branches cloned to different depths, you would hit this error at the same time
    // for all parents, so trying to continue is futile.
  }
  return false
}
