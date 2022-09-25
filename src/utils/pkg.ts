const pkg = require('../../package.json')

const name = pkg.name
const version = pkg.version
let customAgent: string | undefined

export function setGitClientAgent(agent: string) {
  customAgent = agent
}

export function getGitClientAgent() {
  return customAgent || `git/${name}@${version}`
}
