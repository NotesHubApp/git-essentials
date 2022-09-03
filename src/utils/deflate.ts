/* eslint-env node, browser */
/* global CompressionStream */
import pako from 'pako'

declare class CompressionStream implements ReadableWritablePair<unknown, Uint8Array> {
  constructor(format: 'deflate' | 'gzip' | 'deflate-raw')
  readable: ReadableStream<unknown>
  writable: WritableStream<Uint8Array>
}

let supportsCompressionStream: boolean | undefined = undefined

export async function deflate(buffer: string | pako.Data) {
  if (supportsCompressionStream === undefined) {
    supportsCompressionStream = testCompressionStream()
  }

  return supportsCompressionStream
    ? browserDeflate(buffer)
    : pako.deflate(buffer)
}

async function browserDeflate(buffer: string | pako.Data) {
  const cs = new CompressionStream('deflate')
  const c = new Blob([buffer]).stream().pipeThrough(cs)
  return new Uint8Array(await new Response(c).arrayBuffer())
}

function testCompressionStream() {
  try {
    const cs = new CompressionStream('deflate')
    // Test if `Blob.stream` is present. React Native does not have the `stream` method
    new Blob([]).stream()
    if (cs) return true
  } catch (_) {
    // no bother
  }
  return false
}
