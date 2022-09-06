import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { ObjectTypeError } from '../errors/ObjectTypeError'
import { GitAnnotatedTag } from '../models/GitAnnotatedTag'
import { GitCommit } from '../models/GitCommit'
import { _readObject as readObject } from '../storage/readObject'

type ResolveCommitParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  oid: string
}

type ResolveCommitResult = {
  oid: string
  commit: GitCommit
}

export async function resolveCommit({ fs, cache, gitdir, oid }: ResolveCommitParams): Promise<ResolveCommitResult> {
  const { type, object } = await readObject({ fs, cache, gitdir, oid })

  // Resolve annotated tag objects to whatever
  if (type === 'tag') {
    oid = GitAnnotatedTag.from(object).parse().object
    return resolveCommit({ fs, cache, gitdir, oid })
  }

  if (type !== 'commit') {
    throw new ObjectTypeError(oid, type, 'commit')
  }

  return { commit: GitCommit.from(object), oid }
}
