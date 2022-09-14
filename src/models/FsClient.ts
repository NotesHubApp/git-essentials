import { Buffer } from 'buffer'

export type EncodingOpts = {
  encoding?: 'utf8';
}

export type WriteOpts = EncodingOpts & {
  mode?: number
}

export interface RMDirOptions {
  force?: boolean
}

export interface ReadLinkOptions {
  encoding?: 'buffer'
}

export type Stat = {
  mode: number;
  size: number;
  ino: number | BigInt;
  mtimeMs?: number;
  ctimeMs?: number;

  // Non-standard
  uid: number;
  gid: number;
  dev: number;

  ctime?: Date;
  ctimeSeconds?: number;
  ctimeNanoseconds?: number;

  mtime?: Date;
  mtimeSeconds?: number;
  mtimeNanoseconds?: number;
}

/**
 * Access timestamp (atime): which indicates the last time a file was accessed.
 * Modified timestamp (mtime): which is the last time a file's contents were modified.
 * Change timestamp (ctime): which refers to the last time some metadata related to the file was changed.
 */
export type StatLike = Stat & {
  type: 'file' | 'dir' | 'symlink';
  mtimeMs: number;

  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
}

export interface FsClient {
  // highly recommended - usually necessary for apps to work
  readFile(filepath: string, opts: EncodingOpts): Promise<Uint8Array | string>; // throws ENOENT
  writeFile(filepath: string, data: Uint8Array | string, opts: WriteOpts): Promise<void>; // throws ENOENT
  unlink(filepath: string): Promise<void>; // throws ENOENT
  readdir(filepath: string): Promise<string[]>; // throws ENOENT, ENOTDIR
  mkdir(filepath: string): Promise<void>; // throws ENOENT, EEXIST
  rmdir(filepath: string, opts?: RMDirOptions): Promise<void>; // throws ENOENT, ENOTDIR, ENOTEMPTY

  // recommended - often necessary for apps to work
  stat(filepath: string): Promise<StatLike>; // throws ENOENT
  lstat(filepath: string): Promise<StatLike>; // throws ENOENT

  // suggested - used occasionally by apps
  rename(oldFilepath: string, newFilepath: string): Promise<void>; // throws ENOENT
  readlink(filepath: string, opts: ReadLinkOptions): Promise<Buffer | string>; // throws ENOENT
  symlink(target: string, filepath: string): Promise<void>; // throws ENOENT
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
  };
}

export const EEXIST = Err('EEXIST', 47, 'file already exists');
export const ENOENT = Err('ENOENT', 34, 'no such file or directory');
export const ENOTDIR = Err('ENOTDIR', 27, 'not a directory');
export const ENOTEMPTY = Err('ENOTEMPTY', 53, 'directory not empty');
