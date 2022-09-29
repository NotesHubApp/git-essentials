import { Buffer } from 'buffer'
import { EmptyServerResponseError } from '../errors/EmptyServerResponseError'
import { ParseError } from '../errors/ParseError'
import { GitPktLine } from '../models/GitPktLine'

export type RemoteHTTPV1 = {
  protocolVersion?: 1
  capabilities: Set<string>
  refs: Map<string, string>
  symrefs: Map<string, string>
}

export type RemoteHTTPV2 = {
  protocolVersion: 2
  capabilities2: { [key: string]: string | true }
}

export async function parseRefsAdResponse(
  stream: Uint8Array[] | AsyncIterableIterator<Uint8Array>,
  { service }: { service: string }): Promise<RemoteHTTPV1 | RemoteHTTPV2> {

  const capabilities = new Set<string>()
  const refs = new Map<string, string>()
  const symrefs = new Map<string, string>()

  // There is probably a better way to do this, but for now
  // let's just throw the result parser inline here.
  const read = GitPktLine.streamReader(stream)

  let lineOne = await read()
  // skip past any flushes
  while (lineOne === null) lineOne = await read()

  if (lineOne === true) throw new EmptyServerResponseError()

  // Handle protocol v2 responses (Bitbucket Server doesn't include a `# service=` line)
  if (lineOne.includes('version 2')) {
    return parseCapabilitiesV2(read)
  }

  // Clients MUST ignore an LF at the end of the line.
  if (lineOne.toString('utf8').replace(/\n$/, '') !== `# service=${service}`) {
    throw new ParseError(`# service=${service}\\n`, lineOne.toString('utf8'))
  }

  let lineTwo = await read()

  // skip past any flushes
  while (lineTwo === null) lineTwo = await read()

  // In the edge case of a brand new repo, zero refs (and zero capabilities)
  // are returned.
  if (lineTwo === true) return { capabilities, refs, symrefs }
  const lineTwoStr = lineTwo.toString('utf8')

  // Handle protocol v2 responses
  if (lineTwoStr.includes('version 2')) {
    return parseCapabilitiesV2(read)
  }

  const [firstRef, capabilitiesLine] = splitAndAssert(lineTwoStr, '\x00', '\\x00')
  capabilitiesLine.split(' ').map(x => capabilities.add(x))
  const [ref, name] = splitAndAssert(firstRef, ' ', ' ')
  refs.set(name, ref)

  while (true) {
    const line = await read()
    if (line === true) break
    if (line !== null) {
      const [ref, name] = splitAndAssert(line.toString('utf8'), ' ', ' ')
      refs.set(name, ref)
    }
  }

  // Symrefs are thrown into the "capabilities" unfortunately.
  for (const cap of capabilities) {
    if (cap.startsWith('symref=')) {
      const m = cap.match(/symref=([^:]+):(.*)/)
      if (m && m.length === 3) {
        symrefs.set(m[1], m[2])
      }
    }
  }

  return { protocolVersion: 1, capabilities, refs, symrefs }
}

function splitAndAssert(line: string, sep: string, expected: string) {
  const split = line.trim().split(sep)
  if (split.length !== 2) {
    throw new ParseError(expected, line)
  }

  return split
}

/**
 * @param {function} read
 */
async function parseCapabilitiesV2(read: () => Promise<true | Buffer | null>): Promise<RemoteHTTPV2> {
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
