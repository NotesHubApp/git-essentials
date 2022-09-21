import { Buffer } from 'buffer'

type Command = {
  description: string
  command: string
}

function generateCreateFixtureCommands(requestUrl: string, payload?: Buffer): Command[] {
  let requestToHttpFixtureCommand = `node ./scripts/requestToHttpFixture.js ${requestUrl}`
  if (payload) {
    requestToHttpFixtureCommand += ' ' + payload.toString('base64')
  }

  let folderToHttpFixtureCommand = `node ./scripts/folderToHttpFixture.js ${requestUrl}`
  if (payload) {
    folderToHttpFixtureCommand += ' ' + payload.toString('base64')
  }

  return [
    {
      description: 'If you create fixture for remote public repository',
      command: requestToHttpFixtureCommand
    },
    {
      description: 'If you create fixture from local repository located in "tests/fixtures/remotes/*" folder',
      command: folderToHttpFixtureCommand
    }
  ]
}

export class NoMatchingRequestFoundError extends Error {
  constructor(public readonly requestUrl: string, public readonly payload?: Buffer) {
    const commands = generateCreateFixtureCommands(requestUrl, payload)
    const commandsText = commands.map(x => `[${x.description}]\n${x.command}`).join('\n\n')
    const message = `No matching request found. Execute the following command to generate the fixture:\n\n${commandsText}`

    super(message)
  }
}
