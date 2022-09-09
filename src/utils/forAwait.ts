import { getIterator } from './getIterator'

export async function forAwait<T>(iterable: any, cb: (value: T) => void | Promise<void>) {
  const iter = getIterator<T>(iterable)

  while (true) {
    const { value, done } = await iter.next()
    if (value) await cb(value)
    if (done) break
  }

  if (iter.return) await iter.return()
}
