import { ParseError } from '../errors/ParseError'
import { GitPktLine } from '../models/GitPktLine'
import { FIFO } from '../utils/FIFO'

type PushResult = {
  ok: boolean
  error?: string
  refs: { [key: string]: { ok: boolean, error?: string } }
}

export async function parseReceivePackResponse(packfile: FIFO<Buffer>): Promise<PushResult> {
  let response = ''
  const read = GitPktLine.streamReader(packfile)
  let line = await read()
  while (line !== true) {
    if (line !== null) response += line.toString('utf8') + '\n'
    line = await read()
  }

  const lines = response.toString().split('\n')

  // We're expecting "unpack {unpack-result}"
  const strLine = lines.shift()!

  if (!strLine.startsWith('unpack ')) {
    throw new ParseError('unpack ok" or "unpack [error message]', strLine)
  }

  const ok = strLine === 'unpack ok'
  let error: string | undefined

  if (!ok) {
    error = strLine.slice('unpack '.length)
  }

  const refs: { [key: string]: { ok: boolean, error?: string } } = {}

  for (const line of lines) {
    if (line.trim() === '') continue
    const status = line.slice(0, 2)
    const refAndMessage = line.slice(3)
    let space = refAndMessage.indexOf(' ')

    if (space === -1) space = refAndMessage.length
    const ref = refAndMessage.slice(0, space)
    const error = refAndMessage.slice(space + 1)
    refs[ref] = { ok: status === 'ok', error }
  }

  return { ok, error, refs }
}
