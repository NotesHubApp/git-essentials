import { fromValue } from './fromValue.js'

export function getIterator<T>(iterable: any): AsyncIterator<T> {
  if (iterable[Symbol.asyncIterator]) {
    return iterable[Symbol.asyncIterator]()
  }
  if (iterable[Symbol.iterator]) {
    return iterable[Symbol.iterator]()
  }
  if (iterable.next) {
    return iterable
  }
  return fromValue<T>(iterable)
}
