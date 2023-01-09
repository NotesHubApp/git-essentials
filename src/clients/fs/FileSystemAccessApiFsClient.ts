/**
 * @module FileSystemAccessApiFsClient
 */

import {
  FsClient,
  EncodingOptions,
  RmOptions,
  StatsLike,
  EEXIST,
  ENOENT,
  ENOTDIR,
  ENOTEMPTY
} from '../../'

import { BasicStats } from './BasicStats'


const ErrorNames = {
  TypeError: 'TypeError',
  TypeMismatchError: 'TypeMismatchError',
  NotFoundError: 'NotFoundError',
  NotAllowedError: 'NotAllowedError',
  InvalidModificationError: 'InvalidModificationError'
}

type EntryKind = 'file' | 'directory'

type EntryHandle<T> =
  T extends 'file' ? FileSystemFileHandle :
  T extends 'directory' ? FileSystemDirectoryHandle :
  never

/**
 * Represents {@link API.FsClient} implementation which uses [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) under the hood for persistent storage.
 * Meant to be used in a browser environment.
 *
 * ### Limitations
 * * Symlinks are not supported
 * * Partial support for statistics returned by `stat` or `lstat` methods: *size* and *mtimeMs* are only supported and only for files
 * * Poor browser support:
 *   * *Chromium* - full support
 *   * *WebKit* - partial support, could be supported in the Worker thread after some modifications here
 *   * *Firefox* - is not supported
 *
 * @see [MDM: File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
 * @see [WebKit: The File System Access API with Origin Private File System](https://webkit.org/blog/12257/the-file-system-access-api-with-origin-private-file-system)
 * @see [W3C: Origin Private File System (OPFS)](https://wicg.github.io/file-system-access/#wellknowndirectory-origin-private-file-system)
 *
 * @example
 * ```ts
 * const root = await navigator.storage.getDirectory()
 * const reposRoot = await root.getDirectoryHandle('repos', { create: true })
 * const fs = new FileSystemAccessApiFsClient(reposRoot)
 * ```
 */
export class FileSystemAccessApiFsClient implements FsClient {
  constructor(
    private readonly root: FileSystemDirectoryHandle,
    private readonly useSyncAccessHandle: boolean = false) { }

  /**
   * Checks if the browser supports File System Access API.
   */
  public static isSupported() {
    return  'FileSystemFileHandle' in globalThis &&
            'createWritable' in FileSystemFileHandle.prototype
  }

  public async readFile(path: string, options: EncodingOptions = {}): Promise<string | Uint8Array> {
    const { folderPath, leafSegment } = getFolderPathAndLeafSegment(path)
    const targetDir = await this.getDirectoryByPath(folderPath)

    if (!(await this.getEntry(targetDir, leafSegment, 'file'))) {
      throw new ENOENT(path)
    }

    const fileHandle = await targetDir.getFileHandle(leafSegment, { create: false })
    const file = await fileHandle.getFile()

    let data = options.encoding === 'utf8' ?
      await file.text() :
      new Uint8Array(await file.arrayBuffer())

    return data
  }

  public async writeFile(path: string, data: string | Uint8Array, options?: EncodingOptions): Promise<void> {
    const { folderPath, leafSegment } = getFolderPathAndLeafSegment(path)
    const targetDir = await this.getDirectoryByPath(folderPath)

    const fileHandle = await targetDir.getFileHandle(leafSegment, { create: true })
    await writeFile(fileHandle, data, this.useSyncAccessHandle);
  }

  public async readdir(path: string): Promise<string[]> {
    const targetDir = await this.getDirectoryByPath(path)

    const keys = []
    for await (const key of targetDir.keys()) {
      keys.push(key)
    }

    return keys
  }

  public async mkdir(path: string): Promise<void> {
    const { folderPath, leafSegment } = getFolderPathAndLeafSegment(path)
    const targetDir = await this.getDirectoryByPath(folderPath)

    if (await this.getEntry(targetDir, leafSegment, 'directory')) {
      throw new EEXIST(path)
    }

    await targetDir.getDirectoryHandle(leafSegment, { create: true })
  }

  public async rm(path: string, options: RmOptions = {}): Promise<void> {
    const { folderPath, leafSegment } = getFolderPathAndLeafSegment(path)
    const targetDir = await this.getDirectoryByPath(folderPath)

    try {
      await targetDir.removeEntry(leafSegment, { recursive: options.recursive })
    } catch (error: any) {
      const { name } = error
      if (name === ErrorNames.InvalidModificationError) {
        throw new ENOTEMPTY(path)
      }
      throw error
    }
  }

  public async stat(path: string): Promise<StatsLike> {
    if (path === '/') {
      return new BasicStats({ size: 0, lastModified: 0 }, 'dir')
    }

    const { folderPath, leafSegment } = getFolderPathAndLeafSegment(path)
    const targetDir = await this.getDirectoryByPath(folderPath)

    if (await this.getEntry(targetDir, leafSegment, 'directory')) {
      return new BasicStats({ size: 0, lastModified: 0 }, 'dir')
    }

    const fileHandle = await this.getEntry<'file'>(targetDir, leafSegment, 'file')
    if (fileHandle) {
      const file = await fileHandle.getFile()
      return new BasicStats({ size: file.size, lastModified: file.lastModified }, 'file')
    }

    throw new ENOENT(path)
  }

  public async lstat(path: string): Promise<StatsLike> {
    return this.stat(path)
  }

  public async rename(oldPath: string, newPath: string): Promise<void> {
    if (await this.exists(newPath)) {
      throw new EEXIST(newPath)
    }

    const oldFilepathStat = await this.stat(oldPath)
    if (oldFilepathStat.isFile()) {
      const data = await this.readFile(oldPath)
      await this.writeFile(newPath, data)
      await this.rm(oldPath)
    } else if (oldFilepathStat.isDirectory()) {
      await this.mkdir(newPath)
      const sourceFolder = await this.getDirectoryByPath(oldPath)
      const destinationFolder = await this.getDirectoryByPath(newPath)
      await copyDirectoryContent(destinationFolder, sourceFolder, this.useSyncAccessHandle)
      await this.rm(oldPath, { recursive: true })
    } else {
      throw Error('Not Supported')
    }
  }

  /**
   * Symlinks are not supported in the current implementation.
   * @throws Error: symlinks are not supported.
   */
  public async readlink(path: string): Promise<string> {
    throw new Error('Symlinks are not supported.')
  }

  /**
   * Symlinks are not supported in the current implementation.
   * @throws Error: symlinks are not supported.
   */
  public async symlink(target: string, path: string): Promise<void> {
    throw new Error('Symlinks are not supported.')
  }

  /**
   * Return true if a entry exists, false if it doesn't exist.
   * Rethrows errors that aren't related to entry existance.
  */
  public async exists(path: string): Promise<boolean> {
    const { folderPath, leafSegment } = getFolderPathAndLeafSegment(path)

    let targetDir: FileSystemDirectoryHandle
    try {
      targetDir = await this.getDirectoryByPath(folderPath)
    } catch {
      return false
    }

    try {
      await targetDir.getDirectoryHandle(leafSegment, { create: false })
      return true
    } catch { }

    try {
      await targetDir.getFileHandle(leafSegment, { create: false })
      return true
    } catch { }

    return false
  }

  private async getDirectoryByPath(path: string) {
    const segments = split(path)

    let targetDir = this.root

    try {
      for (const segment of segments) {
        targetDir = await targetDir.getDirectoryHandle(segment, { create: false })
      }

      return targetDir
    } catch (error: any) {
      const { name } = error
      switch (name) {
        case ErrorNames.NotFoundError: throw new ENOENT(path)
        case ErrorNames.TypeMismatchError: throw new ENOTDIR(path)
        default: throw error
      }
    }
  }

  private async getEntry<T extends EntryKind>(folder: FileSystemDirectoryHandle, name: string, kind: EntryKind)
    : Promise<EntryHandle<T> | undefined> {
    try {
      if (kind === 'file') {
        return (await folder.getFileHandle(name, { create: false })) as EntryHandle<T>
      } else if (kind === 'directory') {
        return (await folder.getDirectoryHandle(name, { create: false })) as EntryHandle<T>
      }
    } catch (error: any) {
      const { name } = error
      switch (name) {
        case ErrorNames.NotFoundError:
        case ErrorNames.TypeMismatchError:
          return undefined
        default: throw error
      }
    }
  }
}


function split(path: string): string[] {
  return (path ?? '').split('/').filter( x => x)
}

function getFolderPathAndLeafSegment(path: string) {
  const fileNameDelimeter = path.lastIndexOf('/')
  return fileNameDelimeter === -1 ?
    { folderPath: '', leafSegment: path } :
    { folderPath: path.substring(0, fileNameDelimeter), leafSegment: path.substring(fileNameDelimeter + 1, path.length) }
}

const textEncoder = new TextEncoder();
async function writeFile(fileHandle: FileSystemFileHandle, data: ArrayBuffer | string, useSyncAccessHandle: boolean) {
  if (useSyncAccessHandle) {
    const accessHandle = await fileHandle.createSyncAccessHandle()
    accessHandle.write(typeof data === 'string' ? textEncoder.encode(data) : data, { at: 0 })
    await accessHandle.flush()
    await accessHandle.close()
  } else {
    const writable = await fileHandle.createWritable()
    await writable.write(data)
    await writable.close()
  }
}

async function copyDirectoryContent(
  destinationFolder: FileSystemDirectoryHandle,
  sourceFolder: FileSystemDirectoryHandle,
  useSyncAccessHandle: boolean) {
  for await (const item of sourceFolder.values()) {
    if (item.kind === 'file') {
      const sourceFileHandle = await sourceFolder.getFileHandle(item.name, { create: false })
      const file = await sourceFileHandle.getFile()
      const data = await file.arrayBuffer()

      const destinationFileHandle = await destinationFolder.getFileHandle(item.name, { create: true })
      await writeFile(destinationFileHandle, data, useSyncAccessHandle)
    } else if (item.kind === 'directory') {
      const newSourceSubFolder = await sourceFolder.getDirectoryHandle(item.name, { create: false })
      const newDestinationSubFolder = await destinationFolder.getDirectoryHandle(item.name, { create: true })
      await copyDirectoryContent(newDestinationSubFolder, newSourceSubFolder, useSyncAccessHandle)
    }
  }
}
