export function trimEndChar(str: string, char: string): string {
  if (!char || char.length !== 1) {
    throw new Error("trimEndChar expects a single character.")
  }

  let end = str.length
  while (end > 0 && str[end - 1] === char) {
    end--
  }

  return str.slice(0, end)
}
