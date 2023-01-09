declare interface FileSystemDirectoryHandle extends FileSystemHandle {
  keys(): AsyncIterableIterator<string>
  values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>
}

type WriteParams =
  | { type: 'write'; position?: number | undefined; data: BufferSource | Blob | string }
  | { type: 'seek'; position: number }
  | { type: 'truncate'; size: number }

type FileSystemWriteChunkType = BufferSource | Blob | string | WriteParams;

declare interface FileSystemCreateWritableOptions {
  keepExistingData?: boolean | undefined
}

declare interface FileSystemReadWriteOptions {
  at: number
}

declare interface FileSystemSyncAccessHandle {
  read(buffer: ArrayBuffer, options?: FileSystemReadWriteOptions): number
  write(buffer: ArrayBuffer, options?: FileSystemReadWriteOptions): number
  flush(): Promise<void>
  close(): Promise<void>
}

declare class FileSystemWritableFileStream extends WritableStream {
  write(data: FileSystemWriteChunkType): Promise<void>
  seek(position: number): Promise<void>
  truncate(size: number): Promise<void>
}

declare interface FileSystemFileHandle extends FileSystemHandle {
  createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>
  createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle>
}
