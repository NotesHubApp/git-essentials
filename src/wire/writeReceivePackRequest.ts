import { GitPktLine } from '../models/GitPktLine'

type Trip = {
  oldoid: string
  oid: string
  fullRef: string
}

/** @internal */
export async function writeReceivePackRequest(
  { capabilities = [], triplets = [] }:
  { capabilities: string[], triplets: Trip[] }): Promise<Buffer[]> {

  const packstream = []
  let capsFirstLine = `\x00 ${capabilities.join(' ')}`
  for (const trip of triplets) {
    packstream.push(
      GitPktLine.encode(
        `${trip.oldoid} ${trip.oid} ${trip.fullRef}${capsFirstLine}\n`
      )
    )
    capsFirstLine = ''
  }
  packstream.push(GitPktLine.flush())
  return packstream
}
