/**
 * @ignore @module
 */

import { StatsLike } from '../../'

type EntryType = 'file' | 'dir' | 'symlink'

enum FileMode {
  NEW = 0,
  TREE = 16877,
  BLOB = 33188,
  EXECUTABLE = 33261,
  LINK = 40960,
  COMMIT = 57344,
}

function typeToMode(type: EntryType): number {
  switch (type) {
    case 'dir': return FileMode.TREE;
    case 'file': return FileMode.BLOB;
    case 'symlink': return FileMode.LINK
  }
}

/**
 * @internal
 */
export type Stats = {
  size: number
  ctime: Date
  mtime: Date
}

/**
 * @internal
 */
export class BasicStats implements StatsLike {
  private type: EntryType
  mode: number
  size: number
  ino: number
  mtimeMs: number
  ctimeMs?: number
  ctime?: Date
  mtime?: Date
  uid: number
  gid: number
  dev: number

  constructor(stats: Stats, type: 'file' | 'dir' | 'symlink') {
    this.type = type
    this.mode = typeToMode(type)
    this.size = stats.size
    this.ino = 0
    this.ctimeMs = stats.ctime.valueOf()
    this.mtimeMs = stats.mtime.valueOf()
    this.ctime = stats.ctime
    this.mtime = stats.mtime
    this.uid = 1
    this.gid = 1
    this.dev = 1
  }

  isFile() {
    return this.type === 'file'
  }

  isDirectory() {
    return this.type === 'dir'
  }

  isSymbolicLink() {
    return this.type === 'symlink'
  }
}
