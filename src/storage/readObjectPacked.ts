import { Buffer } from 'buffer'

import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { readPackIndex } from '../storage/readPackIndex'
import { join } from '../utils/join'

type ReadObjectPackedParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  oid: string
  getExternalRefDelta: (oid: string) => Promise<{ type: string, object: Buffer }>
}

/** @internal */
export async function readObjectPacked({
  fs,
  cache,
  gitdir,
  oid,
  getExternalRefDelta,
}: ReadObjectPackedParams) {
  // Check to see if it's in a packfile.
  // Iterate through all the .idx files
  let list = (await fs.readdir(join(gitdir, 'objects/pack')))!
  list = list.filter(x => x.endsWith('.idx'))

  for (const filename of list) {
    const indexFile = `${gitdir}/objects/pack/${filename}`
    const p = (await readPackIndex({ fs, cache, filename: indexFile, getExternalRefDelta }))!

    // If the packfile DOES have the oid we're looking for...
    if (p.offsets.has(oid)) {
      // Get the resolved git object from the packfile
      if (!p.pack) {
        const packFile = indexFile.replace(/idx$/, 'pack')

        if (fs.supportsFileSlice) {
          // File-backed reading: read object slices from disk instead of loading entire packfile.
          // This is critical for large packfiles on memory-constrained devices (e.g. iOS).
          const endOffsets = new Map<number, number>()
          const sortedOffsets = [...p.offsets.values()].sort((a, b) => a - b)
          // We need to know the packfile size for the last object's end offset.
          const stat = await fs.stat(packFile)
          for (let i = 0; i < sortedOffsets.length; i++) {
            const start = sortedOffsets[i]
            const end = i + 1 < sortedOffsets.length ? sortedOffsets[i + 1] : stat.size - 20
            endOffsets.set(start, end)
          }
          p.enableFileBackedReads(
            (start: number, end: number) => fs.readFileSlice(packFile, start, end) as Promise<Buffer>,
            endOffsets
          )
        } else {
          p.pack = fs.read(packFile) as Promise<Buffer>
        }
      }

      const result = await p.read({ oid })

      return {
        ...result,
        format: 'content',
        source: `objects/pack/${filename.replace(/idx$/, 'pack')}`
      }
    }
  }
  // Failed to find it
  return null
}
