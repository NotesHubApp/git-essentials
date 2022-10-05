// TODO: make a function that just returns obCount. then emptyPackfile = () => sizePack(pack) === 0
/** @internal */
export function emptyPackfile(pack: Buffer) {
  const pheader = '5041434b'
  const version = '00000002'
  const obCount = '00000000'
  const header = pheader + version + obCount
  return pack.slice(0, 12).toString('hex') === header
}
