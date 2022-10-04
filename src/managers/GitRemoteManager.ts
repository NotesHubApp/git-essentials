import { UnknownTransportError } from '../errors/UnknownTransportError'
import { UrlParseError } from '../errors/UrlParseError'
import { HttpResponse } from '../models'
import { translateSSHtoHTTP } from '../utils/translateSSHtoHTTP'
import { ConnectParams, DiscoverParams, GitRemoteHTTP, RemoteHTTP } from './GitRemoteHTTP'


type RemoteHelper = {
  discover: <T extends 1 | 2>(args: DiscoverParams<T>) => Promise<RemoteHTTP<T>>
  connect: (args: ConnectParams) => Promise<HttpResponse>
}

function parseRemoteUrl({ url }: { url: string }) {
  // the stupid "shorter scp-like syntax"
  if (url.startsWith('git@')) {
    return {
      transport: 'ssh',
      address: url,
    }
  }
  const matches = url.match(/(\w+)(:\/\/|::)(.*)/)
  if (matches === null) return
  /*
   * When git encounters a URL of the form <transport>://<address>, where <transport> is
   * a protocol that it cannot handle natively, it automatically invokes git remote-<transport>
   * with the full URL as the second argument.
   *
   * @see https://git-scm.com/docs/git-remote-helpers
   */
  if (matches[2] === '://') {
    return {
      transport: matches[1],
      address: matches[0],
    }
  }
  /*
   * A URL of the form <transport>::<address> explicitly instructs git to invoke
   * git remote-<transport> with <address> as the second argument.
   *
   * @see https://git-scm.com/docs/git-remote-helpers
   */
  if (matches[2] === '::') {
    return {
      transport: matches[1],
      address: matches[3],
    }
  }
}

export class GitRemoteManager {
  static getRemoteHelperFor({ url }: { url: string }): RemoteHelper {
    // TODO: clean up the remoteHelper API and move into PluginCore
    const remoteHelpers = new Map<string, RemoteHelper>()
    remoteHelpers.set('http', GitRemoteHTTP)
    remoteHelpers.set('https', GitRemoteHTTP)

    const parts = parseRemoteUrl({ url })

    if (!parts) {
      throw new UrlParseError(url)
    }

    if (remoteHelpers.has(parts.transport)) {
      return remoteHelpers.get(parts.transport)!
    }

    throw new UnknownTransportError(
      url,
      parts.transport,
      parts.transport === 'ssh' ? translateSSHtoHTTP(url) : undefined
    )
  }
}
