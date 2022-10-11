/**
 * @module InMemoryFsClient
 */

import { Buffer } from 'buffer'

import {
  EEXIST,
  ENOENT,
  ENOTDIR,
  ENOTEMPTY,
  EncodingOptions,
  FsClient,
  RmOptions,
  StatsLike,
  WriteOptions,
} from '../../'

enum FileMode {
  NEW = 0,
  TREE = 16877,
  BLOB = 33188,
  EXECUTABLE = 33261,
  LINK = 40960,
  COMMIT = 57344,
}

type Stats = {
  mode: number
  size: number
  ctime: Date
  mtime: Date
}

class StatsImpl implements StatsLike {
  private type: 'file' | 'dir' | 'symlink'
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
    this.mode = stats.mode
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


type FileTreeEntry = {
  type: 'file'
  name: string
  content: Uint8Array
  stat: Stats
}

type SymlinkTreeEntry = {
  type: 'symlink'
  name: string
  target: string
  stat: Stats
}

type FolderTreeEntry = {
  type: 'dir'
  name: string
  children: TreeEntry[]
  stat: Stats
}

type TreeEntry = FileTreeEntry | SymlinkTreeEntry | FolderTreeEntry

export type FolderTreeEntryDto = {
  type: 'dir'
  name: string
  children: TreeEntriesDto
}

export type FileTreeEntryDto = {
  type: 'file'
  name: string
  encoding?: 'base64' | 'utf8'
  content: string
}

export type SymlinkTreeEntryDto = {
  type: 'symlink'
  name: string
  target: string
}

export type TreeEntryDto = FolderTreeEntryDto | FileTreeEntryDto | SymlinkTreeEntryDto

export type TreeEntriesDto = TreeEntryDto[]

function makeFile(name: string, content: Uint8Array): FileTreeEntry {
  const now = new Date()
  const stat: Stats = { mode: FileMode.BLOB, size: content.byteLength, ctime: now, mtime: now }
  return { type: 'file', name, content, stat }
}

function updateFileContent(file: FileTreeEntry, newContent: Uint8Array) {
  file.content = newContent
  file.stat.size = newContent.byteLength
  file.stat.mtime = new Date()
}

function makeSymlink(name: string, target: string): SymlinkTreeEntry {
  const now = new Date()
  const stat: Stats = { mode: FileMode.LINK, size: 0, ctime: now, mtime: now }
  return { type: 'symlink', name, target, stat }
}

function makeEmptyFolder(name: string): FolderTreeEntry {
  const now = new Date()
  const stat: Stats = { mode: FileMode.TREE, size: 0, ctime: now, mtime: now }
  return { type: 'dir', name, children: [], stat }
}

function split(path: string): string[] {
  return (path ?? '').split('/').filter( x => x);
}

/**
 * Represents {@link API.FsClient} implementation which keeps all data in memory.
 * Could be useful for testing when data persistence is not required.
 */
export class InMemoryFsClient implements FsClient {
  private readonly root: FolderTreeEntry

  constructor() {
    this.root = makeEmptyFolder('/')
  }

  public async readFile(path: string, options: EncodingOptions = {}): Promise<string | Uint8Array> {
    const { entry } = this.parsePath(path)

    if (!entry || entry.type !== 'file') {
      throw new ENOENT(path)
    }

    const content = options.encoding === 'utf8' ?
      new TextDecoder().decode(entry.content) :
      entry.content

    return content
  }

  public async writeFile(path: string, data: string | Uint8Array, options: WriteOptions = {}): Promise<void> {
    const { folder, entry, entryName } = this.parsePath(path)

    if ((entry && entry.type !== 'file') || !entryName) {
      throw new ENOENT(path)
    }

    const content = typeof data === 'string' ? new TextEncoder().encode(data) : data

    if (entry) {
      updateFileContent(entry, content)
    } else {
      folder.children.push(makeFile(entryName, content))
    }
  }

  public async readdir(path: string): Promise<string[]> {
    const { entry } = this.parsePath(path)

    if (!entry) {
      throw new ENOENT(path)
    }

    if (entry.type !== 'dir') {
      throw new ENOTDIR(path)
    }

    return entry.children.map(x => x.name)
  }

  public async mkdir(path: string): Promise<void> {
    const { folder, entry, entryName } = this.parsePath(path)

    if (!entryName) {
      throw new ENOENT(path)
    }

    if (entry) {
      throw new EEXIST(path)
    }

    folder.children.push(makeEmptyFolder(entryName))
  }

  public async rm(path: string, options: RmOptions = {}): Promise<void> {
    const { folder, entry, entryName } = this.parsePath(path)

    if (!entry) {
      if (options.force) {
        return
      } else {
        throw new ENOENT(path)
      }
    }

    if (entry.type === 'dir' && entry.children.length > 0 && !options.recursive) {
      throw new ENOTEMPTY(path)
    }

    folder.children = folder.children.filter(x => x.name !== entryName)
  }

  public async stat(path: string): Promise<StatsLike> {
    const { entry } = this.parsePath(path)

    if (!entry) {
      throw new ENOENT(path)
    }

    if (entry.type === 'symlink') {
      return await this.stat(entry.target)
    }

    return new StatsImpl(entry.stat, entry.type)
  }

  public async lstat(path: string): Promise<StatsLike> {
    const { entry } = this.parsePath(path)

    if (!entry) {
      throw new ENOENT(path)
    }

    return new StatsImpl(entry.stat, entry.type)
  }

  public async rename(oldPath: string, newPath: string): Promise<void> {
    const { folder: oldFolder, entry: oldEntry, entryName: oldEntryName } = this.parsePath(oldPath)
    const { folder: newFolder, entry: newEntry, entryName: newEntryName } = this.parsePath(newPath)

    if (oldPath === newPath) {
      return
    }

    if (!oldEntry) {
      throw new ENOENT(oldPath)
    }

    if (newEntry) {
      throw new EEXIST(newPath)
    }

    if (!newEntryName) {
      throw new ENOENT(newPath)
    }

    newFolder.children.push({ ...oldEntry, name: newEntryName })
    oldFolder.children = oldFolder.children.filter(x => x.name !== oldEntryName)
  }

  public async readlink(path: string): Promise<string> {
    const { entry } = this.parsePath(path)

    if (!entry || entry.type !== 'symlink') {
      throw new ENOENT(path)
    }

    return entry.target
  }

  public async symlink(target: string, path: string): Promise<void> {
    const { folder, entry, entryName } = this.parsePath(path)

    if (!entryName) {
      throw new ENOENT(path)
    }

    if (entry) {
      throw new EEXIST(path)
    }

    folder.children.push(makeSymlink(entryName, target))
  }

  /**
   * Return true if a file exists, false if it doesn't exist.
   * Rethrows errors that aren't related to file existance.
  */
  public async exists(path: string): Promise<boolean> {
    try {
      await this.stat(path)
      return true
    } catch (err: any) {
      if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
        return false
      } else {
        console.log('Unhandled error in "FileSystem.exists()" function', err)
        throw err
      }
    }
  }

  /**
   * Imports TDO representing file system object into the target path.
   */
  public import(path: string, data: TreeEntriesDto) {
    const { entry } = this.parsePath(path)

    if (!entry) {
      throw new ENOENT(path)
    }

    if (entry.type !== 'dir') {
      throw new ENOTDIR(path)
    }

    if (entry.children.length > 0) {
      throw new ENOTEMPTY(path)
    }

    for (const importEntry of data) {
      switch (importEntry.type) {
        case 'file':
          const content = Buffer.from(importEntry.content, importEntry.encoding ?? 'base64')
          entry.children.push(makeFile(importEntry.name, content))
          break;

        case 'symlink':
          entry.children.push(makeSymlink(importEntry.name, importEntry.target))
          break;

        case 'dir':
          entry.children.push(makeEmptyFolder(importEntry.name))
          this.import(`${path}/${importEntry.name}`, importEntry.children)
          break;
      }
    }
  }

  private parsePath(path: string) {
    const segments = split(path);
    const folders = segments.slice(0, -1)

    let targetFolder = this.root
    for (const folder of folders) {
      const subEntry = targetFolder.children.find(x => x.name === folder)
      if (!subEntry) {
        throw new ENOENT(folder)
      }

      if (subEntry.type !== 'dir') {
        throw new ENOTDIR(folder)
      }

      targetFolder = subEntry as FolderTreeEntry
    }

    const entryName = segments.at(-1)
    const entry = targetFolder.children.find(x => x.name === entryName)
    return { folder: targetFolder, entry, entryName }
  }
}
