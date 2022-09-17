import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models'
import { resolveFilepath } from '../utils/resolveFilepath'
import { resolveTree } from '../utils/resolveTree'
import { TreeEntry } from '../models/GitTree'

type ReadTreeParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  oid: string
  filepath?: string
}

type ReadTreeResult = {
  /** SHA-1 object id of this tree. */
  oid: string

  /** The parsed tree object. */
  tree: TreeEntry[]
}

/**
 * @param {ReadTreeParams} args
 *
 * @returns {Promise<ReadTreeResult>}
 */
export async function _readTree(
  { fs, cache, gitdir, oid, filepath = undefined }: ReadTreeParams): Promise<ReadTreeResult> {

  if (filepath !== undefined) {
    oid = await resolveFilepath({ fs, cache, gitdir, oid, filepath })
  }
  const { tree, oid: treeOid } = await resolveTree({ fs, cache, gitdir, oid })
  const result = {
    oid: treeOid,
    tree: tree.entries(),
  }
  return result
}
