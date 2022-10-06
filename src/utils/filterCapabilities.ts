/** @internal */
export function filterCapabilities(server: string[], client: string[]) {
  const serverNames = server.map(cap => cap.split('=', 1)[0])
  return client.filter(cap => {
    const name = cap.split('=', 1)[0]
    return serverNames.includes(name)
  })
}
