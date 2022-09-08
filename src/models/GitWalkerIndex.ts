import { FileSystem } from './FileSystem'
import { Cache } from './Cache'
import { GitIndexManager } from '../managers/GitIndexManager'
import { compareStrings } from '../utils/compareStrings'
import { flatFileListToDirectoryStructure, Node } from '../utils/flatFileListToDirectoryStructure'
import { mode2type } from '../utils/mode2type'
import { normalizeStats } from '../utils/normalizeStats'
import { GitWalkder, WalkerEntry, WalkerEntryConstructor, WalkerEntryType } from './Walker'
import { Stat } from './IBackend'


export class GitWalkerIndex implements GitWalkder {
  private readonly treePromise: Promise<Map<string, Node>>
  public readonly ConstructEntry: WalkerEntryConstructor

  constructor({ fs, gitdir, cache }: { fs: FileSystem, gitdir: string, cache: Cache }) {
    this.treePromise = GitIndexManager.acquire(
      { fs, gitdir, cache },
      async function(index) {
        return flatFileListToDirectoryStructure(index.entries)
      }
    )

    const walker = this
    this.ConstructEntry = class StageEntry {
      _fullpath: string
      _type: boolean
      _mode: boolean
      _stat: boolean
      _content: undefined
      _oid: boolean
      _actualSize: undefined

      constructor(fullpath: string) {
        this._fullpath = fullpath
        this._type = false
        this._mode = false
        this._stat = false
        this._oid = false
      }

      async type() {
        return walker.type(this)
      }

      async mode() {
        return walker.mode(this)
      }

      async stat() {
        return walker.stat(this)
      }

      async content() {
        return walker.content(this)
      }

      async oid() {
        return walker.oid(this)
      }
    }
  }

  async readdir(entry: WalkerEntry) {
    const filepath = entry._fullpath
    const tree = await this.treePromise
    const inode = tree.get(filepath)
    if (!inode) return null
    if (inode.type === 'blob') return null
    if (inode.type !== 'tree') {
      throw new Error(`ENOTDIR: not a directory, scandir '${filepath}'`)
    }
    const names = inode.children.map(inode => inode.fullpath)
    names.sort(compareStrings)
    return names
  }

  async type(entry: WalkerEntry) {
    if (entry._type === false) {
      await entry.stat()
    }
    return entry._type as WalkerEntryType
  }

  async mode(entry: WalkerEntry) {
    if (entry._mode === false) {
      await entry.stat()
    }
    return entry._mode as number
  }

  async stat(entry: WalkerEntry) {
    if (entry._stat === false) {
      const tree = await this.treePromise
      const inode = tree.get(entry._fullpath)
      if (!inode) {
        throw new Error(
          `ENOENT: no such file or directory, lstat '${entry._fullpath}'`
        )
      }

      const stats = inode.type === 'tree' ? {} as Stat : normalizeStats(inode.metadata as Stat)
      entry._type = inode.type === 'tree' ? 'tree' : mode2type(stats.mode)
      entry._mode = stats.mode
      if (inode.type === 'tree') {
        entry._stat = undefined
      } else {
        entry._stat = stats
      }
    }
    return entry._stat as Stat
  }

  async content(_entry: WalkerEntry) {
    // Cannot get content for an index entry
  }

  async oid(entry: WalkerEntry) {
    if (entry._oid === false) {
      const tree = await this.treePromise
      const inode = tree.get(entry._fullpath)
      entry._oid = inode!.metadata.oid!
    }
    return entry._oid as string
  }
}
