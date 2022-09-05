/* eslint-env node, browser */
/* global DecompressionStream */
import pako from 'pako'

declare class DecompressionStream implements ReadableWritablePair<unknown, Uint8Array> {
  constructor(format: 'deflate' | 'gzip' | 'deflate-raw')
  readable: ReadableStream<unknown>
  writable: WritableStream<Uint8Array>
}

let supportsDecompressionStream = false

export async function inflate(buffer: pako.Data) {
  if (supportsDecompressionStream === null) {
    supportsDecompressionStream = testDecompressionStream()
  }
  return supportsDecompressionStream
    ? browserInflate(buffer)
    : pako.inflate(buffer)
}

async function browserInflate(buffer: pako.Data) {
  const ds = new DecompressionStream('deflate')
  const d = (new Blob([buffer]).stream() as any).pipeThrough(ds)
  return new Uint8Array(await new Response(d).arrayBuffer())
}

function testDecompressionStream() {
  try {
    const ds = new DecompressionStream('deflate')
    if (ds) return true
  } catch (_) {
    // no bother
  }
  return false
}
