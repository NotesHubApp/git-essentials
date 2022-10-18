import env from '../env.json'

const name = env.packageName
const version = env.packageVersion
let customAgent: string | undefined

/** @internal */
export function setGitClientAgent(agent: string) {
  customAgent = agent
}

/** @internal */
export function getGitClientAgent() {
  return customAgent || `git/${name}@${version}`
}
