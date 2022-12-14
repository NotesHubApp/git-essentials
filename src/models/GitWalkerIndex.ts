import { FileSystem } from './FileSystem'
import { Cache } from './Cache'
import { GitIndexManager } from '../managers/GitIndexManager'
import { compareStrings } from '../utils/compareStrings'
import { flatFileListToDirectoryStructure, Node } from '../utils/flatFileListToDirectoryStructure'
import { mode2type } from '../utils/mode2type'
import { normalizeStats } from '../utils/normalizeStats'
import { GitWalker, WalkerEntryInternal, WalkerEntryConstructor, WalkerEntryType } from './Walker'
import { Stats } from './FsClient'


/** @internal */
export class GitWalkerIndex implements GitWalker {
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

  async readdir(entry: WalkerEntryInternal) {
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

  async type(entry: WalkerEntryInternal) {
    if (entry._type === false) {
      await entry.stat()
    }
    return entry._type as WalkerEntryType
  }

  async mode(entry: WalkerEntryInternal) {
    if (entry._mode === false) {
      await entry.stat()
    }
    return entry._mode as number
  }

  async stat(entry: WalkerEntryInternal) {
    if (entry._stat === false) {
      const tree = await this.treePromise
      const inode = tree.get(entry._fullpath)
      if (!inode) {
        throw new Error(
          `ENOENT: no such file or directory, lstat '${entry._fullpath}'`
        )
      }

      const stats = inode.type === 'tree' ? <Stats>{} : normalizeStats(<Stats>inode.metadata)
      entry._type = inode.type === 'tree' ? 'tree' : mode2type(stats.mode)
      entry._mode = stats.mode
      if (inode.type === 'tree') {
        entry._stat = undefined
      } else {
        entry._stat = stats
      }
    }
    return entry._stat as Stats
  }

  async content(_entry: WalkerEntryInternal) {
    // Cannot get content for an index entry
    return undefined
  }

  async oid(entry: WalkerEntryInternal) {
    if (entry._oid === false) {
      const tree = await this.treePromise
      const inode = tree.get(entry._fullpath)
      entry._oid = inode!.metadata.oid!
    }
    return entry._oid as string
  }
}
