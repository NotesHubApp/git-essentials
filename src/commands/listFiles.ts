import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models'
import { _readTree } from '../commands/readTree'
import { GitIndexManager } from '../managers/GitIndexManager'
import { GitRefManager } from '../managers/GitRefManager'
import { join } from '../utils/join'

type ListFilesParams = {
  fs: FileSystem
  gitdir: string
  ref?: string
  cache: Cache
}

type AccumulateFilesFromOidParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  oid: string
  filenames: string[]
  prefix: string
}

/** @internal */
export async function _listFiles({ fs, gitdir, ref, cache }: ListFilesParams): Promise<string[]> {
  if (ref) {
    const oid = await GitRefManager.resolve({ gitdir, fs, ref })
    const filenames: string[] = []
    await accumulateFilesFromOid({
      fs, cache, gitdir, oid, filenames, prefix: ''
    })
    return filenames
  } else {
    return GitIndexManager.acquire({ fs, gitdir, cache }, async function(
      index
    ) {
      return index.entries.map(x => x.path)
    })
  }
}

async function accumulateFilesFromOid({
  fs,
  cache,
  gitdir,
  oid,
  filenames,
  prefix,
}: AccumulateFilesFromOidParams) {
  const { tree } = await _readTree({ fs, cache, gitdir, oid })
  // TODO: Use `walk` to do this. Should be faster.
  for (const entry of tree) {
    if (entry.type === 'tree') {
      await accumulateFilesFromOid({
        fs,
        cache,
        gitdir,
        oid: entry.oid,
        filenames,
        prefix: join(prefix, entry.path),
      })
    } else {
      filenames.push(join(prefix, entry.path))
    }
  }
}
