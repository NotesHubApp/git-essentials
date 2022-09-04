import { compareStrings } from './compareStrings'

type CompareItem = {
  path: string
}

export function comparePath(a: CompareItem, b: CompareItem) {
  // https://stackoverflow.com/a/40355107/2168416
  return compareStrings(a.path, b.path)
}
