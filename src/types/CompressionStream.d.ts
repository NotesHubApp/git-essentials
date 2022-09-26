declare class CompressionStream implements ReadableWritablePair<any, Uint8Array> {
  constructor(format: 'deflate' | 'gzip' | 'deflate-raw')
  readable: ReadableStream
  writable: WritableStream<Uint8Array>
}

declare class DecompressionStream implements ReadableWritablePair<any, Uint8Array> {
  constructor(format: 'deflate' | 'gzip' | 'deflate-raw')
  readable: ReadableStream
  writable: WritableStream<Uint8Array>
}
