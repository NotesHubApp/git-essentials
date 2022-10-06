/** @internal */
export function outdent(str: string) {
  return str
    .split('\n')
    .map(x => x.replace(/^ /, ''))
    .join('\n')
}
