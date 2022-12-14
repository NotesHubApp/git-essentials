/**
 * @see https://dev.to/namirsab/comment/2050
 * @internal
 */
export function arrayRange(start: number, end: number) {
  const length = end - start
  return Array.from({ length }, (_, i) => start + i)
}
