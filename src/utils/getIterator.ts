import { fromValue } from './fromValue'

function instanceOfAsyncIterableIterator<T>(object: any): object is AsyncIterableIterator<T> {
  return Symbol.asyncIterator in object;
}

function instanceOfIterableIterator<T>(object: any): object is (IterableIterator<T> | T[]) {
  return Symbol.iterator in object;
}

function instanceOfAsyncIterator<T>(object: any): object is (Iterator<T, undefined> | AsyncIterator<T, undefined>) {
  if (typeof object.next === 'function') {
    return true
  }
  return false;
}

/** @internal */
export function getIterator<T>(iterable:
  | T[]
  | IterableIterator<T>
  | AsyncIterableIterator<T>
  | Iterator<T, undefined>
  | AsyncIterator<T, undefined>
  | T): Iterator<T, undefined> | AsyncIterator<T, undefined> {

  if (instanceOfAsyncIterableIterator(iterable)) {
    return iterable[Symbol.asyncIterator]()
  }

  if (instanceOfIterableIterator(iterable)) {
    return iterable[Symbol.iterator]()
  }

  if (instanceOfAsyncIterator(iterable)) {
    return iterable
  }

  return fromValue<T>(iterable)
}
