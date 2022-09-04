import { Buffer } from 'buffer'

import { FileSystem } from '../models/FileSystem'
import { GitObject } from '../models/GitObject'
import { writeObjectLoose } from '../storage/writeObjectLoose'
import { deflate } from '../utils/deflate'
import { shasum } from '../utils/shasum'

type WriteObjectParams = {
  fs: FileSystem
  gitdir: string
  type: 'blob' | 'commit' | 'tag' | 'tree'
  object: Buffer
  dryRun?: boolean
}

export async function _writeObject({
  fs,
  gitdir,
  type,
  object,
  dryRun = false
}: WriteObjectParams) {

  object = GitObject.wrap({ type, object })
  const oid = await shasum(object)
  object = Buffer.from(await deflate(object))

  if (!dryRun) {
    await writeObjectLoose({ fs, gitdir, object, format: 'deflated', oid: oid })
  }

  return oid
}
