import { Cache } from '../models/Cache'
import { FileSystem } from '../models/FileSystem'
import { GitTree } from '../models/GitTree'
import { join } from './join'
import { _readObject as readObject } from '../storage/readObject'
import { resolveTree } from './resolveTree'

// the empty file content object id
 const EMPTY_OID = 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391'

type ResolveFileIdInTreeParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  oid: string
  fileId: string
}

type ResolveFileIdParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  tree: GitTree
  fileId: string
  oid: string
  filepaths?: string[]
  parentPath?: string
}

 export async function resolveFileIdInTree({
  fs,
  cache,
  gitdir,
  oid,
  fileId
}: ResolveFileIdInTreeParams): Promise<string | string[] | undefined> {
  if (fileId === EMPTY_OID) {
    return
  }

  const _oid = oid
  const result = await resolveTree({ fs, cache, gitdir, oid })
  const tree = result.tree

  if (fileId === result.oid && 'path' in result) {
    return (result as any).path
  } else {
    const filepaths = await _resolveFileId({
      fs,
      cache,
      gitdir,
      tree,
      fileId,
      oid: _oid,
    })

    if (filepaths.length === 0) {
      return undefined
    } else if (filepaths.length === 1) {
      return filepaths[0]
    } else {
      return filepaths
    }
  }
 }

 async function _resolveFileId({
  fs,
  cache,
  gitdir,
  tree,
  fileId,
  oid,
  filepaths = [],
  parentPath = '',
 }: ResolveFileIdParams): Promise<string[]> {
  const walks = tree.entries().map(function(entry) {
    let result: string | Promise<string | string[]> | undefined = undefined
    if (entry.oid === fileId) {
      result = join(parentPath, entry.path)
      filepaths.push(result)
    } else if (entry.type === 'tree') {
      result = readObject({
        fs,
        cache,
        gitdir,
        oid: entry.oid,
      }).then(function({ object }) {
        return _resolveFileId({
          fs,
          cache,
          gitdir,
          tree: GitTree.from(object),
          fileId,
          oid,
          filepaths,
          parentPath: join(parentPath, entry.path),
        })
      })
    }
    return result
  })

  await Promise.all(walks)
  return filepaths
 }
