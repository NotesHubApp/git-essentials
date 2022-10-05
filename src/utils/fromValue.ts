/**
 * Convert a value to an Async Iterator
 * This will be easier with async generator functions.
 * @internal
 */
export function fromValue<T>(value: T): AsyncIterableIterator<T> {
  let queue: T[] = [value]
  return {
    next(): Promise<IteratorResult<T>> {
      return Promise.resolve({ done: queue.length === 0, value: queue.pop() } as IteratorResult<T>)
    },
    return(): Promise<IteratorResult<T>> {
      queue = []
      return Promise.resolve({ done: true, value: undefined })
    },
    [Symbol.asyncIterator]() {
      return this
    },
  }
}
