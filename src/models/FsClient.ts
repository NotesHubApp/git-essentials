/**
 * @group FsClient
 */
export type EncodingOptions = {
  /** Only supported value is `utf8`. */
  encoding?: 'utf8'
}

/**
 * @group FsClient
 */
export type WriteOptions = EncodingOptions & {
  /** Posix mode permissions. */
  mode?: number
}

/**
 * @group FsClient
 */
export type RmOptions = {
  /** When `true`, exceptions will be ignored if path does not exist. */
  force?: boolean

  /** If `true`, perform a recursive directory removal. */
  recursive?: boolean
}

/**
 * @group FsClient
 */
export type Stats = {
  /** A bit-field describing the file type and mode. */
  mode: number

  /** The size of the file in bytes. */
  size: number

  /** The file system specific "Inode" number for the file. */
  ino: number

  /** The numeric user identifier of the user that owns the file (POSIX). */
  uid: number

  /** The numeric group identifier of the group that owns the file (POSIX). */
  gid: number

  /** The numeric identifier of the device containing the file. */
  dev: number

  /** Modified timestamp (mtime): which is the last time a file's contents were modified. */
  mtime?: Date

  /** The timestamp indicating the last time this file was modified expressed in milliseconds since the POSIX Epoch. */
  mtimeMs?: number

  /** The timestamp indicating the last time this file was modified expressed in seconds since the POSIX Epoch. */
  mtimeSeconds?: number

  /** The timestamp indicating the last time this file was modified expressed in nanoseconds since the POSIX Epoch. */
  mtimeNanoseconds?: number

  /** Change timestamp (ctime): which refers to the last time some metadata related to the file was changed. */
  ctime?: Date

  /** The timestamp indicating the last time the file status was changed expressed in milliseconds since the POSIX Epoch. */
  ctimeMs?: number

  /** The timestamp indicating the last time the file status was changed expressed in seconds since the POSIX Epoch. */
  ctimeSeconds?: number

  /** The timestamp indicating the last time the file status was changed expressed in nanoseconds since the POSIX Epoch. */
  ctimeNanoseconds?: number
}

/**
 * @group FsClient
 */
export type StatsLike = Stats & {
  /** Returns true if the object describes a regular file. */
  isFile(): boolean

  /** Returns true if the object describes a file system directory. */
  isDirectory(): boolean

  /** Returns true if the object describes a symbolic link. */
  isSymbolicLink(): boolean
}

/**
 * An interface that abstracts file system operations.
 *
 * You need to pass a file system client into Git commands that do anything that involves files
 * (which is most things in Git).
 *
 * In Node.js, you can pass the builtin `fs/promises` module.
 * In the browser it's more involved because there's no standard 'fs' module.
 * But you can use any module that implements enough of the `fs` API.
 *
 * ### Node.js
 * If you're only using the library in Node.js, you can just use the native `fs/promises` module:
 *
 * ```typescript
 * import fs from 'fs/promises'
 * import { listFiles } from 'git-essentials'

 * const files = await listFiles({ fs, dir: dirname })
 * console.log(files)
 * ```
 *
 * ### Browser
 * For testing purposes, the library includes in-memory file system implementations
 * which can be used on both Node.js and browser environments.
 * For persistent production use, you will have to use 3rd party client or your own implementation.
 * ```typescript
 * import { InMemoryFsClient } from 'git-essentials/clients/fs/InMemoryFsClient'
 * import { listFiles } from 'git-essentials'
 *
 * const fs = new InMemoryFsClient()
 * const files = await listFiles({ fs, dir: dirname })
 * console.log(files)
 * ```
 *
 * @group FsClient
 */
export interface FsClient {
  /**
   * Asynchronously reads the entire contents of a file.
   * @returns Resolves with the contents of the file as an `Uint8Array` or a `string` if the encoding is set to `utf8`.
   * @throws {@link API.ENOENT}
   */
  readFile(path: string, options?: EncodingOptions): Promise<Uint8Array | string>

  /**
   * Asynchronously writes data to a file, replacing the file if it already exists.
   *
   * @remarks
   * Data can be a `string` or an `Uint8Array`.
   * The encoding option is ignored if data is an `Uint8Array`.
   * @throws {@link API.ENOENT}
   */
  writeFile(path: string, data: Uint8Array | string, options?: WriteOptions): Promise<void>

  /**
   * If path refers to a symbolic link, then the link is removed
   * without affecting the file or directory to which that link refers.
   * If the path refers to a file path that is not a symbolic link, the file is deleted.
   * @throws {@link API.ENOENT}
   */
  unlink(path: string): Promise<void>

  /**
   * Reads the contents of a directory.
   * @throws {@link API.ENOENT}
   * @throws {@link API.ENOTDIR}
   */
  readdir(path: string): Promise<string[]>

  /**
   * Asynchronously creates a directory.
   * @throws {@link API.ENOENT}
   * @throws {@link API.EEXIST}
   */
  mkdir(path: string): Promise<void>

  /**
   * Removes files and directories.
   * @throws {@link API.ENOENT}
   * @throws {@link API.ENOTEMPTY}
   */
  rm(path: string, options?: RmOptions): Promise<void>

  /**
   * Returns information about the given file or directory.
   *
   * @remarks
   * The method follows symlinks.
   * When given a path that is a symlink, it returns the stat of the target of the symlink.
   * @throws {@link API.ENOENT}
   */
  stat(path: string): Promise<StatsLike>

  /**
   * Returns information about the given file or directory.
   *
   * @remarks
   * The method is similar to the `stat` method except it doesn't follow symlinks.
   * When given a path that is a symlink it returns the stat of the symlink and not its target.
   * @throws {@link API.ENOENT}
   */
  lstat(path: string): Promise<StatsLike>

  /**
   * Renames `oldPath` to `newPath`.
   * @throws {@link API.ENOENT}
   */
  rename(oldPath: string, newPath: string): Promise<void>

  /**
   * Returns a symbolic link’s value, i.e. the path it is linked to.
   * @throws {@link API.ENOENT}
   */
  readlink(path: string): Promise<string>

  /**
   * Creates a symbolic link.
   * @throws {@link API.ENOENT}
   */
  symlink(target: string, path: string): Promise<void>
}

/**
 * Base FsClient error.
 * @group FsClient
 */
export class EBASE extends Error {
  public readonly name: string
  public readonly code: string
  public readonly errno: number
  public readonly path?: string

  constructor(name: string, no: number, defaultMessage: string, path?: string) {
    super(defaultMessage)
    this.name = name
    this.code = name
    this.errno = no
    this.path = path
  }
}

/**
 * File already exists error.
 * @group FsClient
 */
export class EEXIST extends EBASE {
  constructor(path?: string) { super('EEXIST', 47, 'file already exists', path) }
}

/**
 * No such file or directory error.
 * @group FsClient
 */
export class ENOENT extends EBASE {
  constructor(path?: string) { super('ENOENT', 34, 'no such file or directory', path) }
}

/**
 * Not a directory error.
 * @group FsClient
 */
export class ENOTDIR extends EBASE {
  constructor(path?: string) { super('ENOTDIR', 27, 'not a directory', path) }
}

/**
 * Directory not empty error.
 * @group FsClient
 */
export class ENOTEMPTY extends EBASE {
  constructor(path?: string) { super('ENOTEMPTY', 53, 'directory not empty', path) }
}
