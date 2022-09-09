/**
 * @param {function} read
 */
 export async function parseCapabilitiesV2(read: () => Promise<true | Buffer | null>) {
  /** @type {Object<string, string | true>} */
  const capabilities2: { [key: string]: string | true } = {}

  while (true) {
    const lineObj = await read()
    if (lineObj === true) break
    if (lineObj === null) continue

    const line = lineObj.toString('utf8').replace(/\n$/, '')
    const i = line.indexOf('=')

    if (i > -1) {
      const key = line.slice(0, i)
      const value = line.slice(i + 1)
      capabilities2[key] = value
    } else {
      capabilities2[line] = true
    }
  }

  return { protocolVersion: 2, capabilities2 }
}
