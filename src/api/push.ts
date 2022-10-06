import { _push } from '../commands/push'
import { FileSystem } from '../models/FileSystem'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'
import {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  Cache,
  FsClient,
  HttpClient,
  HttpHeaders,
  MessageCallback,
  ProgressCallback
} from '../models'


export type PushParams = {
  /** A file system client. */
  fs: FsClient

  /** An HTTP client. */
  http: HttpClient

  /** Optional progress event callback. */
  onProgress?: ProgressCallback

  /** Optional message event callback. */
  onMessage?: MessageCallback

  /** Optional auth fill callback. */
  onAuth?: AuthCallback

  /** Optional auth approved callback. */
  onAuthSuccess?: AuthSuccessCallback

  /** Optional auth rejected callback. */
  onAuthFailure?: AuthFailureCallback

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string

  /** Which branch to push. By default this is the currently checked out branch. */
  ref?: string

  /** The name of the receiving branch on the remote. By default this is the configured remote tracking branch. */
  remoteRef?: string

  /** If URL is not specified, determines which remote to use. */
  remote?: string

  /** The URL of the remote repository. The default is the value set in the git config for that remote. */
  url?: string

  /** If true, behaves the same as `git push --force`. */
  force?: boolean

  /** If true, delete the remote ref. */
  delete?: boolean

  /** Additional headers to include in HTTP requests, similar to git's `extraHeader` config. */
  headers?: HttpHeaders

  /** A cache object. */
  cache?: Cache
}

export type PushResult = {
  ok: boolean
  error?: string
  refs: { [key: string]: { ok: boolean, error?: string } }
  headers?: HttpHeaders
}

/**
 * Push a branch or tag.
 *
 * The push command returns an object that describes the result of the attempted push operation.
 * *Notes:* If there were no errors, then there will be no `errors` property. There can be a mix of `ok` messages and `errors` messages.
 *
 * | param  | type [= default] | description                                                                                                                                                                                                      |
 * | ------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
 * | ok     | Array\<string\>  | The first item is "unpack" if the overall operation was successful. The remaining items are the names of refs that were updated successfully.                                                                    |
 * | errors | Array\<string\>  | If the overall operation threw and error, the first item will be "unpack {Overall error message}". The remaining items are individual refs that failed to be updated in the format "{ref name} {error message}". |
 *
 * @param args
 *
 * @returns Resolves successfully when push completes with a detailed description of the operation from the server.
 *
 * @example
 * const pushResult = await push({
 *   fs,
 *   http,
 *   dir: '/tutorial',
 *   remote: 'origin',
 *   ref: 'main',
 *   onAuth: () => ({ username: process.env.GITHUB_TOKEN }),
 * })
 * console.log(pushResult)
 *
 */
export async function push({
  fs,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir = join(dir, '.git'),
  ref,
  remoteRef,
  remote = 'origin',
  url,
  force = false,
  delete: _delete = false,
  headers = {},
  cache = {},
}: PushParams): Promise<PushResult> {
  try {
    assertParameter('fs', fs)
    assertParameter('http', http)
    assertParameter('gitdir', gitdir)

    return await _push({
      fs: new FileSystem(fs),
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      dir,
      gitdir,
      ref,
      remoteRef,
      remote,
      url,
      force,
      delete: _delete,
      headers
    })
  } catch (err: any) {
    err.caller = 'git.push'
    throw err
  }
}
