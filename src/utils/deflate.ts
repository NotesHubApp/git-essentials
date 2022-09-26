import pako from 'pako'

let supportsCompressionStream: boolean | undefined = undefined

export async function deflate(buffer: string | pako.Data) {
  if (supportsCompressionStream === undefined) {
    supportsCompressionStream = testCompressionStream()
  }

  return supportsCompressionStream && !('__USE_PAKO_DEFLATE__' in globalThis)
    ? browserDeflate(buffer)
    : pako.deflate(buffer)
}

async function browserDeflate(buffer: string | pako.Data) {
  const cs = new CompressionStream('deflate')
  const c = (new Blob([buffer]).stream() as any).pipeThrough(cs)
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
