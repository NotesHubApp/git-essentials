/**
 * @group FsClient
 */
export type EncodingOpts = {
  encoding?: 'utf8';
}

/**
 * @group FsClient
 */
export type WriteOpts = EncodingOpts & {
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
  // highly recommended - usually necessary for apps to work

  /**
   * @throws {@link ENOENT}
   */
  readFile(filepath: string, opts?: EncodingOpts): Promise<Uint8Array | string>

  /**
   * @throws {@link ENOENT}
   */
  writeFile(filepath: string, data: Uint8Array | string, opts?: WriteOpts): Promise<void>

  /**
   * @throws {@link ENOENT}
   */
  unlink(filepath: string): Promise<void>

  /**
   *
   * @throws {@link ENOENT}
   * @throws {@link ENOTDIR}
   */
  readdir(filepath: string): Promise<string[]>

  /**
   *
   * @throws {@link ENOENT}
   * @throws {@link EEXIST}
   */
  mkdir(filepath: string): Promise<void>

  /**
   *
   * @throws {@link ENOENT}
   * @throws {@link ENOTDIR}
   * @throws {@link ENOTEMPTY}
   */
  rmdir(filepath: string, opts?: RMDirOptions): Promise<void>

  // recommended - often necessary for apps to work
  /**
   *
   * @throws {@link ENOENT}
   */
  stat(filepath: string): Promise<StatLike>

  /**
   *
   * @throws {@link ENOENT}
   */
  lstat(filepath: string): Promise<StatLike>

  // suggested - used occasionally by apps
  /**
   *
   * @throws {@link ENOENT}
   */
  rename(oldFilepath: string, newFilepath: string): Promise<void>

  /**
   *
   * @throws {@link ENOENT}
   */
  readlink(filepath: string): Promise<string>

  /**
   *
   * @throws {@link ENOENT}
   */
  symlink(target: string, filepath: string): Promise<void>
}

function Err(name: string, no: number, defaultMessage: string) {
  return class extends Error {
    public readonly name = name;
    public readonly code = name;
    public readonly errno = no;
    public readonly path?: string;

    constructor(path?: string) {
      super(defaultMessage);
      this.path = path;
    }
  }
}

/**
 * File already exists.
 * @group FsClient
 */
export const EEXIST = Err('EEXIST', 47, 'file already exists')

/**
 * No such file or directory.
 * @group FsClient
 */
export const ENOENT = Err('ENOENT', 34, 'no such file or directory')

/**
 * Not a directory.
 * @group FsClient
 */
export const ENOTDIR = Err('ENOTDIR', 27, 'not a directory')

/**
 * Directory not empty.
 * @group FsClient
 */
export const ENOTEMPTY = Err('ENOTEMPTY', 53, 'directory not empty')

