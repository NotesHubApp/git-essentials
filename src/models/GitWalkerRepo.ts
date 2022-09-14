import { FileSystem } from './FileSystem'
import { Cache } from '../models/Cache'
import { NotFoundError } from '../errors/NotFoundError'
import { ObjectTypeError } from '../errors/ObjectTypeError'
import { GitRefManager } from '../managers/GitRefManager'
import { GitTree } from '../models/GitTree'
import { _readObject as readObject } from '../storage/readObject'
import { join } from '../utils/join'
import { normalizeMode } from '../utils/normalizeMode'
import { resolveTree } from '../utils/resolveTree'
import { GitWalkder, WalkerEntryConstructor, WalkerEntryInternal, WalkerEntryType } from './Walker'

type TreeNode = {
  tree?: GitTree
  oid: string
  type: WalkerEntryType
  mode: string | number
}

export class GitWalkerRepo implements GitWalkder {
  private readonly fs: FileSystem
  private readonly gitdir: string
  private readonly cache: Cache
  private readonly mapPromise: Promise<Map<string, TreeNode>>
  public readonly ConstructEntry: WalkerEntryConstructor

  constructor(
    { fs, gitdir, ref, cache }:
    { fs: FileSystem, gitdir: string, ref: string, cache: Cache }) {
    this.fs = fs
    this.cache = cache
    this.gitdir = gitdir
    this.mapPromise = (async () => {
      const map = new Map<string, TreeNode>()
      let oid: string

      try {
        oid = await GitRefManager.resolve({ fs, gitdir, ref })
      } catch (e) {
        if (e instanceof NotFoundError) {
          // Handle fresh branches with no commits
          oid = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
        }
      }

      const tree = (await resolveTree({ fs, cache: cache, gitdir, oid: oid! })) as TreeNode
      tree.type = 'tree'
      tree.mode = '40000'
      map.set('.', tree)
      return map
    })()

    const walker = this
    this.ConstructEntry = class TreeEntry {
      _fullpath: string
      _type: boolean
      _mode: boolean
      _stat: boolean
      _content: boolean
      _oid: boolean
      _actualSize: undefined

      constructor(fullpath: string) {
        this._fullpath = fullpath
        this._type = false
        this._mode = false
        this._stat = false
        this._content = false
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
    const { fs, cache, gitdir } = this
    const map = await this.mapPromise
    const obj = map.get(filepath)
    if (!obj) throw new Error(`No obj for ${filepath}`)
    const oid = obj.oid
    if (!oid) throw new Error(`No oid for obj ${JSON.stringify(obj)}`)
    if (obj.type !== 'tree') {
      // TODO: support submodules (type === 'commit')
      return null
    }
    const { type, object } = await readObject({ fs, cache, gitdir, oid })

    if (type !== obj.type) {
      throw new ObjectTypeError(oid, type, obj.type)
    }

    const tree = GitTree.from(object)
    // cache all entries
    for (const entry of tree) {
      map.set(join(filepath, entry.path), entry)
    }
    return tree.entries().map(entry => join(filepath, entry.path))
  }

  async type(entry: WalkerEntryInternal) {
    if (entry._type === false) {
      const map = await this.mapPromise
      const { type } = (map.get(entry._fullpath)!)
      entry._type = type
    }
    return entry._type as WalkerEntryType
  }

  async mode(entry: WalkerEntryInternal) {
    if (entry._mode === false) {
      const map = await this.mapPromise
      const { mode } = (map.get(entry._fullpath)!)
      entry._mode = normalizeMode(parseInt(mode as string, 8))
    }
    return entry._mode as number
  }

  async stat(_entry: WalkerEntryInternal) {}

  async content(entry: WalkerEntryInternal) {
    if (entry._content === false) {
      const map = await this.mapPromise
      const { fs, cache, gitdir } = this
      const obj = map.get(entry._fullpath)
      const oid = obj!.oid
      const { type, object } = await readObject({ fs, cache, gitdir, oid })
      if (type !== 'blob') {
        entry._content = undefined
      } else {
        entry._content = new Uint8Array(object)
      }
    }

    return entry._content as Uint8Array
  }

  async oid(entry: WalkerEntryInternal) {
    if (entry._oid === false) {
      const map = await this.mapPromise
      const obj = map.get(entry._fullpath)
      entry._oid = obj!.oid
    }

    return entry._oid as string
  }
}
