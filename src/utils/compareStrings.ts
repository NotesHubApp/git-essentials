export function compareStrings(a: string, b: string) {
  // https://stackoverflow.com/a/40355107/2168416
  return -(a < b) || +(a > b)
}
