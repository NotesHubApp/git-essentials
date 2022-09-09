export async function collect(iterable: IterableIterator<Buffer>) {
  let size = 0
  const buffers: Buffer[] = []

  for await (const value of iterable) {
    buffers.push(value)
    size += value.byteLength
  }

  const result = new Uint8Array(size)
  let nextIndex = 0
  for (const buffer of buffers) {
    result.set(buffer, nextIndex)
    nextIndex += buffer.byteLength
  }
  return result
}
