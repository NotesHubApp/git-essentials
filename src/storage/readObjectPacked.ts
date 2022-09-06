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
        p.pack = fs.read(packFile) as Promise<Buffer>
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
