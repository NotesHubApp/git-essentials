import { TreeEntry } from '../models/GitTree'
import { compareStrings } from './compareStrings'

export function compareTreeEntryPath(a: TreeEntry, b: TreeEntry) {
  // Git sorts tree entries as if there is a trailing slash on directory names.
  return compareStrings(appendSlashIfDir(a), appendSlashIfDir(b))
}

function appendSlashIfDir(entry: TreeEntry) {
  return entry.mode === '040000' ? entry.path + '/' : entry.path
}
