import { Author } from '../models/Author'
import { FileSystem } from '../models/FileSystem'
import { normalizeAuthorObject } from '../utils/normalizeAuthorObject'

/**
 *
 * @returns {Promise<void | {name: string, email: string, timestamp: number, timezoneOffset: number }>}
 */
export async function normalizeCommitterObject(
  { fs, gitdir, author, committer }:
  { fs: FileSystem, gitdir: string, author: Author, committer?: Author }): Promise<Author> {
  committer = Object.assign({}, committer || author)
  // Match committer's date to author's one, if omitted
  if (author) {
    committer.timestamp = committer.timestamp || author.timestamp
    committer.timezoneOffset = committer.timezoneOffset || author.timezoneOffset
  }
  committer = (await normalizeAuthorObject({ fs, gitdir, author: committer }))!
  return committer
}
