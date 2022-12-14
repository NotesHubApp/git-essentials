/** @internal */
export function basename(path: string) {
  const last = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  if (last > -1) {
    path = path.slice(last + 1)
  }
  return path
}
