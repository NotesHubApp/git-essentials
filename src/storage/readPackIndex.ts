import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { PackfileCache } from '../models/Cache'
import { GitPackIndex } from '../models/GitPackIndex'

type LoadPackIndexParams = {
  fs: FileSystem
  filename: string
  getExternalRefDelta: (oid: string) => Promise<{ type: string, object: Buffer }>
  emitter?: any
  emitterPrefix?: any
}

type ReadPackIndexParams = LoadPackIndexParams & {
  cache: Cache
}

async function loadPackIndex({
  fs,
  filename,
  getExternalRefDelta,
  emitter,
  emitterPrefix,
}: LoadPackIndexParams) {
  const idx = (await fs.read(filename) as Buffer)
  return GitPackIndex.fromIdx({ idx, getExternalRefDelta })
}

export function readPackIndex({
  fs,
  cache,
  filename,
  getExternalRefDelta,
  emitter,
  emitterPrefix,
}: ReadPackIndexParams) {
  // Try to get the packfile index from the in-memory cache
  if (!cache[PackfileCache]) cache[PackfileCache] = new Map<string, Promise<GitPackIndex>>()
  let p = cache[PackfileCache].get(filename)
  if (!p) {
    p = loadPackIndex({
      fs,
      filename,
      getExternalRefDelta,
      emitter,
      emitterPrefix,
    })
    cache[PackfileCache].set(filename, p)
  }
  return p
}
