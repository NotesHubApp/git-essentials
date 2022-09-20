import { GitHttpRequest } from '../../src';

function generateCreateFixtureCommands(request: GitHttpRequest, payload?: string) {
  let command = `node ./scripts/requestToHttpFixture.js ${request.url}`
  if (payload) {
    command += ' ' + payload
  }

  return command
}

export class NoMatchingRequestFoundError extends Error {
  constructor(public readonly missingRequest: GitHttpRequest, payload?: string) {
    const command = generateCreateFixtureCommands(missingRequest, payload)
    const message = `No matching request found. Execute the following command to generate the fixture:\n\n${command}`

    super(message)
  }
}
