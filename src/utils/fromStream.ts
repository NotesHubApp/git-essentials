function instanceOfAsyncIterableIterator<T>(object: any): object is AsyncIterableIterator<T> {
  return Symbol.asyncIterator in object;
}

// Convert a web ReadableStream (not Node stream!) to an Async Iterator
// adapted from https://jakearchibald.com/2017/async-iterators-and-generators/
export function fromStream<T>(stream: ReadableStream<T>): AsyncIterableIterator<T> {
  // Use native async iteration if it's available.
  if (instanceOfAsyncIterableIterator<T>(stream)) {
    return stream
  }

  const reader = stream.getReader()
  return {
    next(): Promise<IteratorResult<T>> {
      return reader.read() as Promise<IteratorResult<T>>
    },
    return(): Promise<IteratorResult<T>> {
      reader.releaseLock()
      return Promise.resolve({ done: true, value: undefined })
    },
    [Symbol.asyncIterator]() {
      return this
    },
  }
}
