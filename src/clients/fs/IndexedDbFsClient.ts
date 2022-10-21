/**
 * @module IndexedDbFsClient
 */

import { openDB, IDBPDatabase, DBSchema } from 'idb'

import {
  FsClient,
  EncodingOptions,
  StatsLike,
  RmOptions,
  EEXIST,
  ENOENT,
  ENOTDIR,
  ENOTEMPTY
} from '../../'

import { BasicStats, Stats } from './BasicStats'

type FileSystemEntry = {
  fullPath: string,
  data: string | Uint8Array | undefined
}

const EmptyStat: Stats = { size: 0, lastModified: 0 }

const nameof = <T>(name: keyof T) => name

interface FileSystemSchema extends DBSchema {
  files: {
    key: string,
    value: FileSystemEntry
  }
}

/**
 * Represents {@link API.FsClient} implementation which uses [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) under the hood for persistent storage.
 * Meant to be used in a browser environment.
 *
 * ### Limitations
 * * Symlinks are not supported
 * * No support for any statistics returned by `stat` or `lstat` methods
 * * No support for empty directories creation, essentially it behaves very similar to Git which does not store empty directories
 */
export class IndexedDbFsClient implements FsClient {
  #fs: IDBPDatabase<FileSystemSchema> | undefined = undefined

  constructor(private readonly name: string) { }

  public async readFile(path: string, options: EncodingOptions = {}): Promise<Uint8Array | string> {
    const fs = await this.fileSystem()

    const entry = await fs.get('files', path)

    if (entry) {
      if (entry.data === undefined) {
        return options.encoding ? '' : new Uint8Array()
      } else if (options.encoding && typeof entry.data !== 'string') {
        return decode(entry.data)
      } else if (!options.encoding && typeof entry.data === 'string') {
        return encode(entry.data)
      } else {
        return entry.data
      }
    } else {
      throw new ENOENT(path)
    }
  }

  public async writeFile(path: string, data: string | Uint8Array, options?: EncodingOptions): Promise<void> {
    const entry: FileSystemEntry = {
      fullPath: path,
      ...pathIndexes.generatePathParams(path),
      data: data
    }

    const fs = await this.fileSystem()
    await fs.put('files', entry)
  }

  public async readdir(path: string): Promise<string[]> {
    const fs = await this.fileSystem()
    const transaction = fs.transaction('files', 'readonly')
    const files = transaction.objectStore('files')

    const filePath = await files.getKey(path)
    if (filePath) {
      await transaction.done
      throw new ENOTDIR(path)
    }

    const pathParts = path === '/' ? 1 : path.split('/').length
    if (pathParts <= pathIndexes.maxLevel) {
      const indexName = PathIndexes.getPathIndexName(pathParts)
      const index = (files as any).index(indexName)
      let cursor = await index.openKeyCursor(directoryChildItemsKeyRange(path), 'nextunique')
      const entries: string[] = []

      while (cursor) {
        entries.push(cursor.key.substring(cursor.key.lastIndexOf('/') + 1))
        cursor = await cursor.continue()
      }

      await transaction.done
      return entries
    } else {
      const dirEntries = new Set<string>()
      const dirpath = path + '/'
      let cursor = await files.openKeyCursor(startsWithKeyRange(dirpath))

      while (cursor) {
        const key = cursor.key
        const nextSlash = key.indexOf('/', dirpath.length)
        const dirEntry = key.substring(dirpath.length, nextSlash !== -1 ? nextSlash : undefined)
        dirEntries.add(dirEntry)
        cursor = await cursor.continue()
      }

      await transaction.done
      return Array.from(dirEntries)
    }
  }

  public async mkdir(path: string): Promise<void> {}

  public async rm(path: string, options: RmOptions = {}): Promise<void> {
    const fs = await this.fileSystem()
    const transaction = fs.transaction('files', 'readwrite')
    const files = transaction.objectStore('files')

    const existingFilepath = await files.getKey(path)

    if (existingFilepath) {
      await files.delete(path)
      await transaction.done
    } else {
      let dirChildItemCursor = await files.openCursor(directoryChildItemsKeyRange(path))

      if (options.recursive) {
        while (dirChildItemCursor) {
          await dirChildItemCursor.delete()
          dirChildItemCursor = await dirChildItemCursor.continue()
        }

        await transaction.done
      } else if (dirChildItemCursor) {
        await transaction.done
        throw new ENOTEMPTY(path)
      }
    }
  }

  public async stat(path: string): Promise<StatsLike> {
    if (path === '/') {
      return new BasicStats(EmptyStat, 'dir')
    }

    const fs = await this.fileSystem()
    const transaction = fs.transaction('files', 'readonly')
    const files = transaction.objectStore('files')

    const entry = await files.getKey(path)
    if (entry) {
      await transaction.done
      return new BasicStats(EmptyStat, 'file')
    } else {
      const cursor = await files.openKeyCursor(directoryChildItemsKeyRange(path))
      await transaction.done
      if (cursor) {
        return new BasicStats(EmptyStat, 'dir')
      }

      throw new ENOENT(path)
    }
  }

  public async lstat(path: string): Promise<StatsLike> {
    return this.stat(path)
  }

  public async rename(oldPath: string, newPath: string): Promise<void> {
    const fs = await this.fileSystem()
    const transaction = fs.transaction('files', 'readwrite')
    const files = transaction.objectStore('files')

    const renameFile = async (existingItem: FileSystemEntry, newFilepath: string) => {
      await files.add({
        data: existingItem.data,
        fullPath: newFilepath,
        ...pathIndexes.generatePathParams(newFilepath)
      })
      await files.delete(existingItem.fullPath)
    }

    const existingOldItem = await files.get(oldPath)

    if (existingOldItem) {
      const existingNewFilepath = await files.getKey(newPath)
      if (existingNewFilepath) {
        await transaction.done
        throw new EEXIST(newPath)
      }

      await renameFile(existingOldItem, newPath)
    } else {
      let cursorOnExistingOldDirectory = await files.openCursor(directoryChildItemsKeyRange(oldPath))
      if (!cursorOnExistingOldDirectory) {
        await transaction.done
        throw new ENOENT(oldPath)
      }

      const cursorOnNewDirectory = await files.openKeyCursor(directoryChildItemsKeyRange(newPath))
      if (cursorOnNewDirectory) {
        await transaction.done
        throw new EEXIST(newPath)
      }

      while (cursorOnExistingOldDirectory) {
        const updatedFilepath = newPath + cursorOnExistingOldDirectory.key.substring(oldPath.length)
        await renameFile(cursorOnExistingOldDirectory.value, updatedFilepath)
        cursorOnExistingOldDirectory = await cursorOnExistingOldDirectory.continue()
      }
    }

    await transaction.done
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
    try {
      await this.stat(path)
      return true
    } catch (err: any) {
      if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
        return false
      } else {
        throw err
      }
    }
  }

  private async fileSystem(): Promise<IDBPDatabase<FileSystemSchema>> {
    if (!this.#fs) {
      this.#fs = await this.openFileSystem(this.name)
    }
    return this.#fs
  }

  private async openFileSystem(name: string): Promise<IDBPDatabase<FileSystemSchema>> {
    return await openDB<FileSystemSchema>(name, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', {
            keyPath: nameof<FileSystemEntry>('fullPath')
          })

          pathIndexes.createIndexes(filesStore as any)
        }
      }
    })
  }
}

class PathIndexes {
  constructor(public readonly maxLevel: number) {}

  public createIndexes(filesStore: IDBObjectStore) {
    this.enumerateIndexes((level, indexName) => filesStore.createIndex(indexName, indexName, { unique: false }))
  }

  public generatePathParams(filepath: string) {
    const pathParts = filepath.split('/')

    const result: any = {}
    let currentPathLevel = ''

    this.enumerateIndexes((level, indexName) => {
      if (pathParts.length > level) {
        currentPathLevel += '/' + pathParts[level]
        result[indexName] = currentPathLevel
      } else {
        result[indexName] = ''
      }
    })

    return result
  }

  private enumerateIndexes(action: (level: number, indexName: string) => void) {
    for (let level = 1; level <= this.maxLevel; level++) {
      action(level, PathIndexes.getPathIndexName(level))
    }
  }

  public static getPathIndexName = (level: number) => 'pathLevel' + level
}

const utf8Decoder = new TextDecoder("utf-8")
function decode(uint8array: Uint8Array): string {
  return utf8Decoder.decode(uint8array)
}

const utf8Encoder = new TextEncoder()
function encode(text: string): Uint8Array {
  return utf8Encoder.encode(text)
}

function startsWithKeyRange(prefix: string) {
  return IDBKeyRange.bound(prefix, prefix + String.fromCodePoint(0x10ffff), false, false)
}

function directoryChildItemsKeyRange(directoryPath: string) {
  return startsWithKeyRange(directoryPath === '/' ? directoryPath : directoryPath + '/')
}

const pathIndexes = new PathIndexes(4)
