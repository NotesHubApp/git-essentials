import {
  EEXIST,
  EncodingOpts,
  ENOENT,
  ENOTDIR,
  ENOTEMPTY,
  FsClient,
  ReadLinkOptions,
  RMDirOptions,
  Stat,
  StatLike,
  WriteOpts
} from '../../src';


export class InMemoryFsClient implements FsClient {
  private readonly root: FolderTreeEntry

  constructor() {
    this.root = makeEmptyFolder('/')
  }

  public async readFile(filepath: string, opts: EncodingOpts): Promise<string | Uint8Array> {
    const { entry } = this.parsePath(filepath)

    if (!entry || entry.type !== 'file') {
      throw new ENOENT(filepath)
    }

    const content = opts && opts.encoding === 'utf8' ?
      new TextDecoder().decode(entry.content) :
      entry.content

    return content
  }

  public async writeFile(filepath: string, data: string | Uint8Array, opts: WriteOpts): Promise<void> {
    const { folder, entry, entryName } = this.parsePath(filepath)

    if ((entry && entry.type !== 'file') || !entryName) {
      throw new ENOENT(filepath)
    }

    const content = typeof data === 'string' ? new TextEncoder().encode(data) : data

    if (entry) {
      updateFileContent(entry, content)
    } else {
      folder.children.push(makeNewFile(entryName, content))
    }
  }

  public async unlink(filepath: string): Promise<void> {
    const { folder, entry, entryName } = this.parsePath(filepath)

    if (!entry) {
      throw new ENOENT(filepath)
    }

    if (entry.type === 'dir') {
      throw new ENOENT(filepath)
    }

    folder.children = folder.children.filter(x => x.name !== entryName)
  }

  public async readdir(filepath: string): Promise<string[]> {
    const { entry } = this.parsePath(filepath)

    if (!entry) {
      throw new ENOENT(filepath)
    }

    if (entry.type !== 'dir') {
      throw new ENOTDIR(filepath)
    }

    return entry.children.map(x => x.name)
  }

  public async mkdir(filepath: string): Promise<void> {
    const { folder, entry, entryName } = this.parsePath(filepath)

    if (!entryName) {
      throw new ENOENT(filepath)
    }

    if (entry) {
      throw new EEXIST(filepath)
    }

    folder.children.push(makeEmptyFolder(entryName))
  }

  public async rmdir(filepath: string, opts?: RMDirOptions | undefined): Promise<void> {
    const { folder, entry, entryName } = this.parsePath(filepath)

    if (!entry) {
      throw new ENOENT(filepath)
    }

    if (entry.type !== 'dir') {
      throw new ENOTDIR(filepath)
    }

    if (entry.children.length > 0 && !(opts && opts.force)) {
      throw new ENOTEMPTY(filepath)
    }

    folder.children = folder.children.filter(x => x.name !== entryName)
  }

  public async stat(filepath: string): Promise<StatLike> {
    const { entry } = this.parsePath(filepath)

    if (!entry) {
      throw new ENOENT(filepath)
    }

    if (entry.type === 'symlink') {
      return await this.stat(entry.target)
    }

    return new StatImpl(entry.stat, entry.type)
  }

  public async lstat(filepath: string): Promise<StatLike> {
    const { entry } = this.parsePath(filepath)

    if (!entry) {
      throw new ENOENT(filepath)
    }

    return new StatImpl(entry.stat, entry.type)
  }

  public async rename(oldFilepath: string, newFilepath: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async readlink(filepath: string, opts: ReadLinkOptions): Promise<string | Buffer> {
    throw new Error('Method not implemented.');
  }

  public async symlink(target: string, filepath: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private parsePath(filepath: string) {
    const segments = split(filepath);
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

enum FileMode {
  NEW = 0,
  TREE = 16877,
  BLOB = 33188,
  EXECUTABLE = 33261,
  LINK = 40960,
  COMMIT = 57344,
};

export class StatImpl implements StatLike {
  type: 'file' | 'dir' | 'symlink';
  mode: number;
  size: number;
  ino: number | BigInt;
  mtimeMs: number;
  ctimeMs?: number;
  ctime?: Date
  mtime?: Date
  uid: number;
  gid: number;
  dev: number;

  constructor(stats: Stat, type: 'file' | 'dir' | 'symlink') {
    this.type = type;
    this.mode = stats.mode;
    this.size = stats.size;
    this.ino = stats.ino;
    this.mtimeMs = stats.mtimeMs!;
    this.ctimeMs = stats.ctimeMs || stats.mtimeMs;
    this.ctime = stats.ctime
    this.mtime = stats.mtime
    this.uid = 1;
    this.gid = 1;
    this.dev = 1;
  }

  isFile() {
    return this.type === 'file';
  }

  isDirectory() {
    return this.type === 'dir';
  }

  isSymbolicLink() {
    return this.type === 'symlink';
  }
};


type FileTreeEntry = {
  type: 'file'
  name: string
  content: Uint8Array
  stat: Stat
}

type SymlinkTreeEntry = {
  type: 'symlink'
  name: string
  target: string
  stat: Stat
}

type FolderTreeEntry = {
  type: 'dir'
  name: string
  children: TreeEntry[]
  stat: Stat
}

type TreeEntry = FileTreeEntry | SymlinkTreeEntry | FolderTreeEntry

function makeNewFile(name: string, content: Uint8Array): FileTreeEntry {
  const now = new Date()
  const stat: Stat = { mode: FileMode.BLOB, size: content.byteLength, uid: 1, gid: 1, dev: 1, ino: 0, ctime: now, mtime: now }
  return { type: 'file', name, content, stat }
}

function updateFileContent(file: FileTreeEntry, newContent: Uint8Array) {
  file.content = newContent
  file.stat.size = newContent.byteLength
  file.stat.mtime = new Date()
}

function makeEmptyFolder(name: string): FolderTreeEntry {
  const now = new Date()
  const stat: Stat = { mode: FileMode.TREE, size: 0, uid: 1, gid: 1, dev: 1, ino: 0, ctime: now, mtime: now }
  return { type: 'dir', name, children: [], stat }
}

export function split(path: string): string[] {
  return (path ?? '').split('/').filter( x => x);
}
