import { Buffer } from 'buffer'

import { InternalError } from '../errors/InternalError'
import { UnsafeFilepathError } from '../errors'
import { comparePath } from '../utils/comparePath'
import { compareTreeEntryPath } from '../utils/compareTreeEntryPath'

/** @internal */
export type TreeEntry = {
  mode: string | number // the 6 digit hexadecimal mode
  path: string // the name of the file or directory
  oid: string // the SHA-1 object id of the blob or tree
  sha?: string // GitHub specific
  type: 'commit' | 'blob' | 'tree' // the type of object
}

function mode2type(mode: string) {
  // prettier-ignore
  switch (mode) {
    case '040000': return 'tree'
    case '100644': return 'blob'
    case '100755': return 'blob'
    case '120000': return 'blob'
    case '160000': return 'commit'
  }
  throw new InternalError(`Unexpected GitTree entry mode: ${mode}`)
}

function parseBuffer(buffer: Buffer): TreeEntry[] {
  const _entries: TreeEntry[] = []
  let cursor = 0
  while (cursor < buffer.length) {
    const space = buffer.indexOf(32, cursor)
    if (space === -1) {
      throw new InternalError(
        `GitTree: Error parsing buffer at byte location ${cursor}: Could not find the next space character.`
      )
    }
    const nullchar = buffer.indexOf(0, cursor)
    if (nullchar === -1) {
      throw new InternalError(
        `GitTree: Error parsing buffer at byte location ${cursor}: Could not find the next null character.`
      )
    }
    let mode = buffer.slice(cursor, space).toString('utf8')
    if (mode === '40000') mode = '040000' // makes it line up neater in printed output
    const type = mode2type(mode)
    const path = buffer.slice(space + 1, nullchar).toString('utf8')

    // Prevent malicious git repos from writing to "..\foo" on clone etc
    if (path.includes('\\') || path.includes('/')) {
      throw new UnsafeFilepathError(path)
    }

    const oid = buffer.slice(nullchar + 1, nullchar + 21).toString('hex')
    cursor = nullchar + 21
    _entries.push({ mode, path, oid, type })
  }
  return _entries
}

function limitModeToAllowed(mode: string | number) {
  if (typeof mode === 'number') {
    mode = mode.toString(8)
  }
  // tree
  if (mode.match(/^0?4.*/)) return '040000' // Directory
  if (mode.match(/^1006.*/)) return '100644' // Regular non-executable file
  if (mode.match(/^1007.*/)) return '100755' // Regular executable file
  if (mode.match(/^120.*/)) return '120000' // Symbolic link
  if (mode.match(/^160.*/)) return '160000' // Commit (git submodule reference)
  throw new InternalError(`Could not understand file mode: ${mode}`)
}

function nudgeIntoShape(entry: TreeEntry) {
  if (!entry.oid && entry.sha) {
    entry.oid = entry.sha // Github
  }
  entry.mode = limitModeToAllowed(entry.mode) // index
  if (!entry.type) {
    entry.type = mode2type(entry.mode) // index
  }
  return entry
}

/** @internal */
export class GitTree {
  private readonly _entries: TreeEntry[]

  constructor(entries: Buffer | TreeEntry[]) {
    if (Buffer.isBuffer(entries)) {
      this._entries = parseBuffer(entries)
    } else if (Array.isArray(entries)) {
      this._entries = entries.map(nudgeIntoShape)
    } else {
      throw new InternalError('invalid type passed to GitTree constructor')
    }
    // Tree entries are not sorted alphabetically in the usual sense (see `compareTreeEntryPath`)
    // but it is important later on that these be sorted in the same order as they would be returned from readdir.
    this._entries.sort(comparePath)
  }

  static from(tree: Buffer | TreeEntry[]) {
    return new GitTree(tree)
  }

  render() {
    return this._entries
      .map(entry => `${entry.mode} ${entry.type} ${entry.oid}    ${entry.path}`)
      .join('\n')
  }

  toObject() {
    // Adjust the sort order to match git's
    const entries = [...this._entries]
    entries.sort(compareTreeEntryPath)

    return Buffer.concat(
      entries.map(entry => {
        const modeStr = typeof entry.mode === 'number' ? entry.mode.toString(8) : entry.mode
        const mode = Buffer.from(modeStr.replace(/^0/, ''))
        const space = Buffer.from(' ')
        const path = Buffer.from(entry.path, 'utf8')
        const nullchar = Buffer.from([0])
        const oid = Buffer.from(entry.oid, 'hex')
        return Buffer.concat([mode, space, path, nullchar, oid])
      })
    )
  }

  /**
   * @returns {TreeEntry[]}
   */
  entries(): TreeEntry[] {
    return this._entries
  }

  *[Symbol.iterator]() {
    for (const entry of this._entries) {
      yield entry
    }
  }
}
