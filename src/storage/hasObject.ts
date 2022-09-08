import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { hasObjectLoose } from '../storage/hasObjectLoose'
import { hasObjectPacked } from '../storage/hasObjectPacked'
import { _readObject as readObject } from '../storage/readObject'

export async function hasObject(
  { fs, cache, gitdir, oid }:
  { fs: FileSystem, cache: Cache, gitdir: string, oid: string }) {
  // Curry the current read method so that the packfile un-deltification
  // process can acquire external ref-deltas.
  const getExternalRefDelta = (oid: string) => readObject({ fs, cache, gitdir, oid })

  // Look for it in the loose object directory.
  let result = await hasObjectLoose({ fs, gitdir, oid })
  // Check to see if it's in a packfile.
  if (!result) {
    result = await hasObjectPacked({
      fs,
      cache,
      gitdir,
      oid,
      getExternalRefDelta,
    })
  }
  // Finally
  return result
}
