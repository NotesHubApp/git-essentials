import {
  EEXIST,
  EncodingOpts,
  ENOENT,
  ENOTDIR,
  ENOTEMPTY,
  FsClient,
  ReadLinkOptions,
  RMDirOptions,
  StatLike,
  WriteOpts
} from '../../src/models/FsClient';


export class InMemoryFsClient implements FsClient {
  private readonly root: FolderTreeEntry

  constructor() {
    this.root = emptyFolder('/')
  }

  public async readFile(filepath: string, opts: EncodingOpts): Promise<string | Uint8Array> {
    throw new Error('Method not implemented.');
  }

  public async writeFile(filepath: string, data: string | Uint8Array, opts: WriteOpts): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async unlink(filepath: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async readdir(filepath: string): Promise<string[]> {
    const { folder, entryName } = this.parsePath(filepath)

    const targetEntry = folder.children.find(x => x.name === entryName)
    if (!targetEntry) {
      throw new ENOENT(filepath)
    }

    if (targetEntry.type !== 'folder') {
      throw new ENOTDIR(filepath)
    }

    return targetEntry.children.map(x => x.name)
  }

  public async mkdir(filepath: string): Promise<void> {
    const { folder, entryName } = this.parsePath(filepath)

    if (!entryName) {
      throw new ENOENT(filepath)
    }

    if (folder.children.some(x => x.name === entryName)) {
      throw new EEXIST(filepath)
    }

    folder.children.push(emptyFolder(entryName))
  }

  public async rmdir(filepath: string, opts?: RMDirOptions | undefined): Promise<void> {
    const { folder, entryName } = this.parsePath(filepath)

    const targetEntry = folder.children.find(x => x.name === entryName)
    if (!targetEntry) {
      throw new ENOENT(filepath)
    }

    if (targetEntry.type !== 'folder') {
      throw new ENOTDIR(filepath)
    }

    if (targetEntry.children.length > 0 && (!opts || !opts.force)) {
      throw new ENOTEMPTY(filepath)
    }

    folder.children = folder.children.filter(x => x.name !== entryName)
  }

  public async stat(filepath: string): Promise<StatLike> {
    console.log(filepath)
    throw new Error('Method not implemented.');
  }

  public async lstat(filepath: string): Promise<StatLike> {
    throw new Error('Method not implemented.');
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

      if (subEntry.type !== 'folder') {
        throw new ENOTDIR(folder)
      }

      targetFolder = subEntry as FolderTreeEntry
    }

    return { folder: targetFolder, entryName: segments.at(-1) }
  }
}


type FileTreeEntry = {
  type: 'file'
  name: string
  content: Uint8Array
}

type SymlinkTreeEntry = {
  type: 'symlink'
  name: string
}

type FolderTreeEntry = {
  type: 'folder'
  name: string
  children: TreeEntry[]
}

type TreeEntry = FileTreeEntry | SymlinkTreeEntry | FolderTreeEntry

function emptyFolder(name: string): FolderTreeEntry {
  return { type: 'folder', name, children: [] }
}

export function split(path: string): string[] {
  return (path ?? '').split('/').filter( x => x);
}
