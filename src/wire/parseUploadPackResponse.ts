import { InvalidOidError } from '../errors/InvalidOidError'
import { GitSideBand } from '../models/GitSideBand'
import { FIFO } from '../utils/FIFO'
import { forAwait } from '../utils/forAwait'

type ParseUploadPackResponseResult = {
  shallows: string[]
  unshallows: string[]
  acks: { oid: string, status: string }[]
  nak: boolean
  packfile: FIFO<Buffer>
  progress: FIFO<Buffer>
}

export async function parseUploadPackResponse(stream: AsyncIterableIterator<Uint8Array>) {
  const { packetlines, packfile, progress } = GitSideBand.demux(stream)
  const shallows: string[] = []
  const unshallows: string[] = []
  const acks: { oid: string, status: string }[] = []
  let nak = false
  let done = false

  return new Promise<ParseUploadPackResponseResult>((resolve, reject) => {
    // Parse the response
    forAwait(packetlines, (data: Buffer) => {
      const line = data.toString('utf8').trim()
      if (line.startsWith('shallow')) {
        const oid = line.slice(-41).trim()

        if (oid.length !== 40) {
          reject(new InvalidOidError(oid))
        }

        shallows.push(oid)
      } else if (line.startsWith('unshallow')) {
        const oid = line.slice(-41).trim()

        if (oid.length !== 40) {
          reject(new InvalidOidError(oid))
        }

        unshallows.push(oid)
      } else if (line.startsWith('ACK')) {
        const [, oid, status] = line.split(' ')
        acks.push({ oid, status })
        if (!status) done = true
      } else if (line.startsWith('NAK')) {
        nak = true
        done = true
      }

      if (done) {
        resolve({ shallows, unshallows, acks, nak, packfile, progress })
      }
    })
  })
}
