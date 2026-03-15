import { Buffer } from 'buffer'
import { WritableStreamHandle } from '../models/FsClient'

type WritePackfileStreamResult = {
  /** The packfile SHA extracted from the last 20 bytes of the stream. */
  packfileSha: string
  /** Whether the packfile is empty (PACK v2 with 0 objects). */
  isEmpty: boolean
  /** Total size of the packfile in bytes. */
  totalSize: number
}

const EMPTY_PACKFILE_HEADER = '5041434b' + '00000002' + '00000000'

/**
 * Streams an async iterable to a writable stream while capturing
 * the packfile SHA (last 20 bytes) and detecting empty packfiles
 * (by inspecting the first 12 bytes).
 *
 * NOTE: The caller is responsible for closing the writable stream.
 *
 * @internal
 */
export async function writePackfileStream(
  iterable: Uint8Array[] | AsyncIterableIterator<Uint8Array>,
  writable: WritableStreamHandle
): Promise<WritePackfileStreamResult> {
  const headerBytes = Buffer.alloc(12)
  let headerBytesCollected = 0
  let totalSize = 0

  // Rolling buffer to capture the last 20 bytes (packfile SHA)
  let tailBuffer = Buffer.alloc(0)

  for await (const chunk of iterable) {
    // Capture first 12 bytes for empty packfile detection
    if (headerBytesCollected < 12) {
      const needed = 12 - headerBytesCollected
      const toCopy = Math.min(needed, chunk.byteLength)
      Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength).copy(headerBytes, headerBytesCollected, 0, toCopy)
      headerBytesCollected += toCopy
    }

    await writable.write(chunk)
    totalSize += chunk.byteLength

    // Maintain a rolling buffer of the last 20 bytes
    if (tailBuffer.byteLength + chunk.byteLength <= 20) {
      tailBuffer = Buffer.concat([tailBuffer, Buffer.from(chunk)])
    } else {
      tailBuffer = Buffer.concat([tailBuffer, Buffer.from(chunk)]).slice(-20)
    }
  }

  const packfileSha = tailBuffer.toString('hex')
  const isEmpty = totalSize <= 32 || headerBytes.slice(0, 12).toString('hex') === EMPTY_PACKFILE_HEADER

  return { packfileSha, isEmpty, totalSize }
}
