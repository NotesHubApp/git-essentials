import { Buffer } from 'buffer'


function generateCreateFixtureCommands(requestUrl: string, payload?: Buffer) {
  let command = `node ./scripts/requestToHttpFixture.js ${requestUrl}`
  if (payload) {
    command += ' ' + payload.toString('base64')
  }

  return command
}

export class NoMatchingRequestFoundError extends Error {
  constructor(public readonly requestUrl: string, public readonly payload?: Buffer) {
    const command = generateCreateFixtureCommands(requestUrl, payload)
    const message = `No matching request found. Execute the following command to generate the fixture:\n\n${command}`

    super(message)
  }
}
