/**
 * @group FsClient
 */
export type EncodingOpts = {
  /** Only supported value is `utf8` */
  encoding?: 'utf8';
}

/**
 * @group FsClient
 */
export type WriteOpts = EncodingOpts & {
  /** Posix mode permissions */
  mode?: number
}

/**
 * @group FsClient
 */
export type RMDirOptions = {}

/**
 * @group FsClient
 */
export type Stat = {
  /** A bit-field describing the file type and mode. */
  mode: number;

  /** The size of the file in bytes. */
  size: number;

  /** The file system specific "Inode" number for the file. */
  ino: number | BigInt;

  /** The timestamp indicating the last time this file was modified expressed in milliseconds since the POSIX Epoch. */
  mtimeMs?: number;

  /** The timestamp indicating the last time the file status was changed expressed in milliseconds since the POSIX Epoch. */
  ctimeMs?: number;

  // Non-standard

  /** The numeric user identifier of the user that owns the file (POSIX). */
  uid: number;

  /** The numeric group identifier of the group that owns the file (POSIX). */
  gid: number;

  /** The numeric identifier of the device containing the file. */
  dev: number;

  /** Change timestamp (ctime): which refers to the last time some metadata related to the file was changed. */
  ctime?: Date;
  ctimeSeconds?: number;
  ctimeNanoseconds?: number;

  /** Modified timestamp (mtime): which is the last time a file's contents were modified. */
  mtime?: Date;
  mtimeSeconds?: number;
  mtimeNanoseconds?: number;
}

/**
 * @group FsClient
 */
export type StatLike = Stat & {
  mtimeMs: number;

  /** Returns true if the <fs.Stats> object describes a regular file. */
  isFile(): boolean;

  /** Returns true if the <fs.Stats> object describes a file system directory. */
  isDirectory(): boolean;

  /** Returns true if the <fs.Stats> object describes a symbolic link. */
  isSymbolicLink(): boolean;
}

/**
 * @group FsClient
 */
export interface FsClient {
  /**
   * Asynchronously reads the entire contents of a file.
   * @returns Resolves with the contents of the file as an Uint8Array or (if the encoding is `utf8`) a string.
   * @throws {@link API.ENOENT}
   */
  readFile(filepath: string, opts?: EncodingOpts): Promise<Uint8Array | string>

  /**
   * Asynchronously writes data to a file, replacing the file if it already exists.
   * Data can be a string or an Uint8Array.
   * The encoding option is ignored if data is an Uint8Array.
   * @throws {@link API.ENOENT}
   */
  writeFile(filepath: string, data: Uint8Array | string, opts?: WriteOpts): Promise<void>

  /**
   * If path refers to a symbolic link, then the link is removed
   * without affecting the file or directory to which that link refers.
   * If the path refers to a file path that is not a symbolic link, the file is deleted.
   * @throws {@link API.ENOENT}
   */
  unlink(filepath: string): Promise<void>

  /**
   * Reads the contents of a directory.
   * @throws {@link API.ENOENT}
   * @throws {@link API.ENOTDIR}
   */
  readdir(filepath: string): Promise<string[]>

  /**
   *
   * @throws {@link API.ENOENT}
   * @throws {@link API.EEXIST}
   */
  mkdir(filepath: string): Promise<void>

  /**
   *
   * @throws {@link API.ENOENT}
   * @throws {@link API.ENOTDIR}
   * @throws {@link API.ENOTEMPTY}
   */
  rmdir(filepath: string, opts?: RMDirOptions): Promise<void>

  /**
   *
   * @throws {@link API.ENOENT}
   */
  stat(filepath: string): Promise<StatLike>

  /**
   *
   * @throws {@link API.ENOENT}
   */
  lstat(filepath: string): Promise<StatLike>

  /**
   *
   * @throws {@link API.ENOENT}
   */
  rename(oldFilepath: string, newFilepath: string): Promise<void>

  /**
   *
   * @throws {@link API.ENOENT}
   */
  readlink(filepath: string): Promise<string>

  /**
   *
   * @throws {@link API.ENOENT}
   */
  symlink(target: string, filepath: string): Promise<void>
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
