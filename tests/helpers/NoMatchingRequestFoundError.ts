import { Buffer } from 'buffer'


function generateHttpFixtureCommand(requestUrl: string, payload?: Buffer): string {
  let command = `npm run gen-http-fixture ${requestUrl}`
  if (payload) {
    command += ' ' + payload.toString('base64')
  }

  return command
}

export class NoMatchingRequestFoundError extends Error {
  constructor(public readonly requestUrl: string, public readonly payload?: Buffer) {
    const command = generateHttpFixtureCommand(requestUrl, payload)
    const message = `No matching request found. Execute the following command to generate the fixture:\n\n${command}`

    super(message)
  }
}
