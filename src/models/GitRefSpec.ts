import { InternalError } from '../errors/InternalError'

/** @internal */
export class GitRefSpec {
  private readonly remotePath: string
  public readonly localPath: string
  private readonly force: boolean
  public readonly matchPrefix: boolean

  constructor(
    { remotePath, localPath, force, matchPrefix }:
    { remotePath: string, localPath: string, force: boolean, matchPrefix: boolean }) {

    this.remotePath = remotePath
    this.localPath = localPath
    this.force = force
    this.matchPrefix = matchPrefix
  }

  static from(refspec: string) {
    const [
      forceMatch,
      remotePath,
      remoteGlobMatch,
      localPath,
      localGlobMatch,
    ] = refspec.match(/^(\+?)(.*?)(\*?):(.*?)(\*?)$/)!.slice(1)
    const force = forceMatch === '+'
    const remoteIsGlob = remoteGlobMatch === '*'
    const localIsGlob = localGlobMatch === '*'
    // validate
    // TODO: Make this check more nuanced, and depend on whether this is a fetch refspec or a push refspec
    if (remoteIsGlob !== localIsGlob) {
      throw new InternalError('Invalid refspec')
    }
    return new GitRefSpec({
      remotePath,
      localPath,
      force,
      matchPrefix: remoteIsGlob,
    })
    // TODO: We need to run resolveRef on both paths to expand them to their full name.
  }

  translate(remoteBranch: string) {
    if (this.matchPrefix) {
      if (remoteBranch.startsWith(this.remotePath)) {
        return this.localPath + remoteBranch.replace(this.remotePath, '')
      }
    } else {
      if (remoteBranch === this.remotePath) return this.localPath
    }
    return null
  }

  reverseTranslate(localBranch: string) {
    if (this.matchPrefix) {
      if (localBranch.startsWith(this.localPath)) {
        return this.remotePath + localBranch.replace(this.localPath, '')
      }
    } else {
      if (localBranch === this.localPath) return this.remotePath
    }
    return null
  }
}
