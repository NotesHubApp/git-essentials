import { BaseError } from './BaseError'

type NoRefspecErrorData = {
  remote: string
}

export class NoRefspecError extends BaseError<NoRefspecErrorData> {
  public static readonly code = 'NoRefspecError'

  /**
   * @param {string} remote
   */
  constructor(remote: string) {
    super(`Could not find a fetch refspec for remote "${remote}". Make sure the config file has an entry like the following:
[remote "${remote}"]
\tfetch = +refs/heads/*:refs/remotes/origin/*
`,
    NoRefspecError.code,
    { remote })
  }
}
