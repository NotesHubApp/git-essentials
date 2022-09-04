export type EncodingOpts = {
  encoding?: 'utf8';
}

export interface RMDirOptions {
  force?: boolean
}

export interface ReadLinkOptions {
  encoding?: 'buffer'
}

type StatLike = {
  type: 'file' | 'dir' | 'symlink';
  mode: number;
  size: number;
  ino: number | string | BigInt;
  mtimeMs: number;
  ctimeMs?: number;

  isFile(): boolean;
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
}

export interface IBackend {
  // highly recommended - usually necessary for apps to work
  readFile(filepath: string, opts: EncodingOpts): Promise<Uint8Array | string>; // throws ENOENT
  writeFile(filepath: string, data: Uint8Array | string, opts: EncodingOpts): Promise<void>; // throws ENOENT
  unlink(filepath: string): Promise<void>; // throws ENOENT
  readdir(filepath: string): Promise<string[]>; // throws ENOENT, ENOTDIR
  mkdir(filepath: string): Promise<void>; // throws ENOENT, EEXIST
  rmdir(filepath: string, opts?: RMDirOptions): Promise<void>; // throws ENOENT, ENOTDIR, ENOTEMPTY

  // recommended - often necessary for apps to work
  stat(filepath: string): Promise<StatLike>; // throws ENOENT
  lstat(filepath: string): Promise<StatLike>; // throws ENOENT

  // suggested - used occasionally by apps
  rename(oldFilepath: string, newFilepath: string): Promise<void>; // throws ENOENT
  readlink(filepath: string, opts: ReadLinkOptions): Promise<string>; // throws ENOENT
  symlink(target: string, filepath: string): Promise<void>; // throws ENOENT
}
