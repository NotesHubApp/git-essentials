/** @internal */
export function dirname(path: string) {
  const last = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  if (last === -1) return '.'
  if (last === 0) return '/'
  return path.slice(0, last)
}
