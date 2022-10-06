import { Buffer } from 'buffer'

import { FileSystem } from '../models/FileSystem'

/** @internal */
export async function readObjectLoose(
  { fs, gitdir, oid }:
  { fs: FileSystem, gitdir: string,oid: string }) {
  const source = `objects/${oid.slice(0, 2)}/${oid.slice(2)}`
  const file = (await fs.read(`${gitdir}/${source}`)) as Buffer
  if (!file) {
    return null
  }
  return { object: file, format: 'deflated', source }
}
