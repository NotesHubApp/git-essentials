/** @internal */
export function padHex(b: number, n: number) {
  const s = n.toString(16)
  return '0'.repeat(b - s.length) + s
}
