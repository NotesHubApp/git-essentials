/**
 * @module FileSystemAccessApiFsClient
 */

import {
  EEXIST,
  ENOENT,
  ENOTDIR,
  ENOTEMPTY,
  EncodingOptions,
  FsClient,
  RmOptions,
  StatsLike
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
 * Operation name passed to retry/error callbacks.
 * - `writeFile`: a file write operation
 * - `stat`: a stat (file/directory metadata) operation
 */
export type Operation = 'writeFile' | 'stat'

/**
 * Callback invoked before each retry attempt.
 * @param operation - the operation being retried
 * @param attempt - current attempt number (1-based)
 * @param error - the error that triggered the retry
 * @param path - optional filesystem path related to the operation
 */
export type RetryCallback = (operation: Operation, attempt: number, error: Error, path?: string) => void

/**
 * Callback invoked when a non-retriable error occurs or retries are exhausted.
 * @param operation - the operation that failed
 * @param error - the encountered error
 * @param path - optional filesystem path related to the operation
 */
export type ErrorCallback = (operation: Operation, error: unknown, path?: string) => void

/**
 * Configuration options for the `FileSystemAccessApiFsClient`.
 */
export type FileSystemAccessApiClientOptions = {
  /**
   * If true, use the synchronous access handle API (OPFS) for writes when
   * available. This can improve write performance in supporting browsers.
   */
  useSyncAccessHandle: boolean
  /**
   * Maximum number of retry attempts for transient errors (e.g. browser
   * UnknownError) before giving up.
   */
  maxRetries: number
  /**
   * Initial delay in milliseconds used for exponential backoff when retrying
   * operations. Each retry doubles the delay (plus some jitter).
   */
  initRetryDelayMs: number
  /**
   * Called before each retry attempt. Receives the operation name, the
   * attempt number, the error that triggered the retry, and an optional path.
   */
  onRetry: RetryCallback
  /**
   * Called when a non-retriable error occurs (or when retries are exhausted).
   * Receives the operation name, the error, and an optional path.
   */
  onError: ErrorCallback
  /**
   * When true, enable an in-memory cache of directory handles to avoid
   * repeated handle lookups for the same paths.
   */
  enableCache: boolean
}

const DefaultFileSystemAccessApiClientOptions: FileSystemAccessApiClientOptions = {
  useSyncAccessHandle: false,
  maxRetries: 4,
  initRetryDelayMs: 200,
  onRetry: () => {},
  onError: () => {},
  enableCache: false
}

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
  private readonly textEncoder = new TextEncoder()
  private directoryHandlesCache = new Map<string, FileSystemDirectoryHandle>()
  private readonly options: FileSystemAccessApiClientOptions

  constructor(
    private readonly root: FileSystemDirectoryHandle,
    options: Partial<FileSystemAccessApiClientOptions> = {}) {
    this.options = {
      ...DefaultFileSystemAccessApiClientOptions,
      ...options
    }
  }
  /**
   * Checks if the browser supports File System Access API.
   */
  public static isSupported() {
    return  'FileSystemFileHandle' in globalThis &&
            'createWritable' in FileSystemFileHandle.prototype
  }

  public async readFile(path: string, options: EncodingOptions = {}): Promise<string | Uint8Array> {
    const { folderPath, leafSegment } = this.getFolderPathAndLeafSegment(path)
    const targetDir = await this.getDirectoryByPath(folderPath)

    const fileHandle = await this.getEntry<'file'>(targetDir, leafSegment, 'file')
    if (fileHandle === undefined) {
      throw new ENOENT(path)
    }

    const file = await fileHandle.getFile()

    const data = options.encoding === 'utf8' ?
      await file.text() :
      new Uint8Array(await file.arrayBuffer())

    return data
  }

  public async writeFile(path: string, data: string | Uint8Array, options?: EncodingOptions): Promise<void> {
    const { folderPath, leafSegment } = this.getFolderPathAndLeafSegment(path)
    const targetDir = await this.getDirectoryByPath(folderPath)

    await this.writeFileIntern(targetDir, leafSegment, data)
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
    const { folderPath, leafSegment } = this.getFolderPathAndLeafSegment(path)
    const targetDir = await this.getDirectoryByPath(folderPath)

    if (await this.getEntry(targetDir, leafSegment, 'directory')) {
      throw new EEXIST(path)
    }

    await targetDir.getDirectoryHandle(leafSegment, { create: true })
  }

  public async rm(path: string, options: RmOptions = {}): Promise<void> {
    const { folderPath, leafSegment } = this.getFolderPathAndLeafSegment(path)
    const targetDir = await this.getDirectoryByPath(folderPath)

    try {
      await targetDir.removeEntry(leafSegment, { recursive: options.recursive })

      this.directoryHandlesCache.delete(path)
      if (options.recursive) {
        for (const key of this.directoryHandlesCache.keys()) {
          if (key.startsWith(path)) {
            this.directoryHandlesCache.delete(key)
          }
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const { folderPath, leafSegment } = this.getFolderPathAndLeafSegment(path)
    const targetDir = await this.getDirectoryByPath(folderPath)

    return await this.retryOperation(async () => {
      if (await this.getEntry(targetDir, leafSegment, 'directory')) {
        return new BasicStats({ size: 0, lastModified: 0 }, 'dir')
      }

      const fileHandle = await this.getEntry<'file'>(targetDir, leafSegment, 'file')
      if (fileHandle) {
        const file = await fileHandle.getFile()
        return new BasicStats({ size: file.size, lastModified: file.lastModified }, 'file')
      }

      throw new ENOENT(path)
    }, 'stat', path)
  }

  public async lstat(path: string): Promise<StatsLike> {
    return await this.stat(path)
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
      await this.copyDirectoryContent(destinationFolder, sourceFolder)
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
    const { folderPath, leafSegment } = this.getFolderPathAndLeafSegment(path)

    let targetDir: FileSystemDirectoryHandle
    try {
      targetDir = await this.getDirectoryByPath(folderPath)
    } catch {
      return false
    }

    try {
      await targetDir.getDirectoryHandle(leafSegment, { create: false })
      return true
    // eslint-disable-next-line no-empty
    } catch { }

    try {
      await targetDir.getFileHandle(leafSegment, { create: false })
      return true
    // eslint-disable-next-line no-empty
    } catch { }

    return false
  }

  private async getDirectoryByPath(path: string) {
    if (this.options.enableCache) {
      const cachedDirectory = this.directoryHandlesCache.get(path)
      if (cachedDirectory) {
        return cachedDirectory
      }
    }

    const segments = this.split(path)

    let targetDir = this.root

    try {
      for (const segment of segments) {
        targetDir = await targetDir.getDirectoryHandle(segment, { create: false })
      }

      if (this.options.enableCache) {
        this.directoryHandlesCache.set(path, targetDir)
      }

      return targetDir
    } catch (error) {
      if (error instanceof TypeError) {
        throw new ENOTDIR(path)
      }

      if (error instanceof DOMException) {
        switch (error.name) {
          case ErrorNames.NotFoundError: throw new ENOENT(path)
          case ErrorNames.TypeMismatchError: throw new ENOTDIR(path)
        }
      }

      throw error
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
    } catch (error) {
      if (error instanceof TypeError) {
        return undefined
      }

      if (error instanceof DOMException) {
        switch (error.name) {
          case ErrorNames.NotFoundError:
          case ErrorNames.TypeMismatchError:
            return undefined
        }
      }

      throw error
    }
  }

  private split(path: string): string[] {
    return (path ?? '').split('/').filter( x => x)
  }

  private getFolderPathAndLeafSegment(path: string) {
    const fileNameDelimeter = path.lastIndexOf('/')
    return fileNameDelimeter === -1 ?
      { folderPath: '', leafSegment: path } :
      { folderPath: path.substring(0, fileNameDelimeter), leafSegment: path.substring(fileNameDelimeter + 1, path.length) }
  }

  private async writeFileIntern(directory: FileSystemDirectoryHandle, name: string, data: string | Uint8Array) {
    await this.retryOperation(async () => {
      const fileHandle = await directory.getFileHandle(name, { create: true })

      if (this.options.useSyncAccessHandle) {
        const accessHandle = await fileHandle.createSyncAccessHandle()
        const dataArray = typeof data === 'string' ? this.textEncoder.encode(data) : data
        accessHandle.write(dataArray.buffer as ArrayBuffer, { at: 0 })
        await accessHandle.flush()
        await accessHandle.close()
      } else {
        const writable = await fileHandle.createWritable()
        await writable.write(typeof data === 'string' ? data : data.buffer as ArrayBuffer)
        await writable.close()
      }
    }, 'writeFile', name)
  }

  private async copyDirectoryContent(
    destinationFolder: FileSystemDirectoryHandle,
    sourceFolder: FileSystemDirectoryHandle) {
    for await (const item of sourceFolder.values()) {
      if (item.kind === 'file') {
        const sourceFileHandle = await sourceFolder.getFileHandle(item.name, { create: false })
        const file = await sourceFileHandle.getFile()
        const data = await file.arrayBuffer()

        await this.writeFileIntern(destinationFolder, item.name, new Uint8Array(data))
      } else if (item.kind === 'directory') {
        const newSourceSubFolder = await sourceFolder.getDirectoryHandle(item.name, { create: false })
        const newDestinationSubFolder = await destinationFolder.getDirectoryHandle(item.name, { create: true })
        await this.copyDirectoryContent(newDestinationSubFolder, newSourceSubFolder)
      }
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, operationType: Operation, path?: string): Promise<T> {
    let attempt = 0

    while (true) {
      try {
        return await operation()
      } catch (error) {
        // Safari may throw the error: "The operation failed for an unknown transient reason (e.g. out of memory)"
        if (error instanceof DOMException && error.name === 'UnknownError' && attempt < this.options.maxRetries) {
          attempt++
          await this.backOff(attempt, this.options.initRetryDelayMs)
          this.options.onRetry(operationType, attempt, error, path)
        } else {
          if (error instanceof DOMException && error.name === 'UnknownError') {
            this.options.onError(operationType, error, path)
          }
          throw error
        }
      }
    }
  }

  private async backOff(attempt: number, initDelayMs: number) {
    const baseDelay = initDelayMs * Math.pow(2, attempt - 1)
    const jitter = Math.random() * baseDelay * 0.2  // Add up to 20% jitter
    const delay = baseDelay + jitter
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}
