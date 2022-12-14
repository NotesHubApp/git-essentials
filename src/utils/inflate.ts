import pako from 'pako'

let supportsDecompressionStream = false

/** @internal */
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
  const d = (<ReadableStream><unknown>new Blob([buffer]).stream()).pipeThrough(ds)
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
