import { FileSystem } from '../models/FileSystem'
import { normalizeAuthorObject } from '../utils/normalizeAuthorObject'
import { Author } from '../models/Author'
import { NormalizedAuthor } from '../models/NormalizedAuthor'

/** @internal */
export async function normalizeCommitterObject(
  { fs, gitdir, author, committer }:
  { fs: FileSystem, gitdir: string, author: NormalizedAuthor, committer?: Author }): Promise<NormalizedAuthor> {

  committer = Object.assign({}, committer || author)

  // Match committer's date to author's one, if omitted
  if (author) {
    committer.timestamp = committer.timestamp || author.timestamp
    committer.timezoneOffset = committer.timezoneOffset || author.timezoneOffset
  }

  return (await normalizeAuthorObject({ fs, gitdir, author: committer }))!
}
