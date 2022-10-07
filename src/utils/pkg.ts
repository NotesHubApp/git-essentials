const pkg = require('../../package.json')

const name = pkg.name
const version = pkg.version
let customAgent: string | undefined

/** @internal */
export function setGitClientAgent(agent: string) {
  customAgent = agent
}

/** @internal */
export function getGitClientAgent() {
  return customAgent || `git/${name}@${version}`
}
