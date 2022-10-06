import { FileSystem } from '../models/FileSystem'

/** @internal */
export async function hasObjectLoose({ fs, gitdir, oid }: { fs: FileSystem, gitdir: string, oid: string }) {
  const source = `objects/${oid.slice(0, 2)}/${oid.slice(2)}`
  return fs.exists(`${gitdir}/${source}`)
}
