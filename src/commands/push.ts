import { FileSystem } from '../models/FileSystem'
import { _currentBranch } from '../commands/currentBranch'
import { _findMergeBase } from '../commands/findMergeBase'
import { _isDescendent } from '../commands/isDescendent'
import { listCommitsAndTags } from '../commands/listCommitsAndTags'
import { listObjects } from '../commands/listObjects'
import { _pack } from '../commands/pack'
import { GitPushError } from '../errors/GitPushError'
import { MissingParameterError } from '../errors/MissingParameterError'
import { NotFoundError } from '../errors/NotFoundError'
import { PushRejectedError } from '../errors/PushRejectedError'
import { GitConfigManager } from '../managers/GitConfigManager'
import { GitRefManager } from '../managers/GitRefManager'
import { GitRemoteManager } from '../managers/GitRemoteManager'
import { GitSideBand } from '../models/GitSideBand'
import { filterCapabilities } from '../utils/filterCapabilities'
import { forAwait } from '../utils/forAwait'
import { pkg } from '../utils/pkg'
import { splitLines } from '../utils/splitLines'
import { parseReceivePackResponse, PushResult } from '../wire/parseReceivePackResponse'
import { writeReceivePackRequest } from '../wire/writeReceivePackRequest'
import {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  Cache,
  HttpClient,
  HttpHeaders,
  MessageCallback,
  ProgressCallback
} from '../models'

export { PushResult }


type PushParams = {
  fs: FileSystem
  cache: Cache
  http: HttpClient
  onProgress?: ProgressCallback
  onMessage?: MessageCallback
  onAuth?: AuthCallback
  onAuthSuccess?: AuthSuccessCallback
  onAuthFailure?: AuthFailureCallback
  dir: string
  gitdir: string
  ref?: string
  remoteRef?: string
  remote?: string
  url?: string
  force?: boolean
  delete?: boolean
  headers?: HttpHeaders
}

/**
 * @param {PushParams} args
 *
 * @returns {Promise<PushResult>}
 */
export async function _push({
  fs,
  cache,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir,
  ref: _ref,
  remoteRef: _remoteRef,
  remote,
  url: _url,
  force = false,
  delete: _delete = false,
  headers = {},
}: PushParams): Promise<PushResult> {
  const ref = _ref || (await _currentBranch({ fs, gitdir }))
  if (typeof ref === 'undefined') {
    throw new MissingParameterError('ref')
  }
  const config = await GitConfigManager.get({ fs, gitdir })
  // Figure out what remote to use.
  remote =
    remote ||
      config.get(`branch.${ref}.pushRemote`) ||
      config.get('remote.pushDefault') ||
      config.get(`branch.${ref}.remote`) ||
      'origin'
  // Lookup the URL for the given remote.
  const url =
    _url ||
      config.get(`remote.${remote}.pushurl`) ||
      config.get(`remote.${remote}.url`)

      if (typeof url === 'undefined') {
    throw new MissingParameterError('remote OR url')
  }

  // Figure out what remote ref to use.
  const remoteRef = _remoteRef || config.get(`branch.${ref}.merge`)
  if (typeof url === 'undefined') {
    throw new MissingParameterError('remoteRef')
  }

  const fullRef = await GitRefManager.expand({ fs, gitdir, ref })
  const oid = _delete
    ? '0000000000000000000000000000000000000000'
    : await GitRefManager.resolve({ fs, gitdir, ref: fullRef })

  /** @type typeof import("../managers/GitRemoteHTTP").GitRemoteHTTP */
  const GitRemoteHTTP = GitRemoteManager.getRemoteHelperFor({ url })
  const httpRemote = await GitRemoteHTTP.discover({
    http,
    onAuth,
    onAuthSuccess,
    onAuthFailure,
    service: 'git-receive-pack',
    url,
    headers,
    protocolVersion: 1,
  })
  const auth = httpRemote.auth // hack to get new credentials from CredentialManager API
  let fullRemoteRef
  if (!remoteRef) {
    fullRemoteRef = fullRef
  } else {
    try {
      fullRemoteRef = await GitRefManager.expandAgainstMap({
        ref: remoteRef,
        map: httpRemote.refs,
      })
    } catch (err) {
      if (err instanceof NotFoundError) {
        // The remote reference doesn't exist yet.
        // If it is fully specified, use that value. Otherwise, treat it as a branch.
        fullRemoteRef = remoteRef.startsWith('refs/')
          ? remoteRef
          : `refs/heads/${remoteRef}`
      } else {
        throw err
      }
    }
  }
  const oldoid =
    httpRemote.refs.get(fullRemoteRef) ||
    '0000000000000000000000000000000000000000'

  // Remotes can always accept thin-packs UNLESS they specify the 'no-thin' capability
  const thinPack = !httpRemote.capabilities.has('no-thin')

  let objects = new Set<string>()
  if (!_delete) {
    const finish = [...httpRemote.refs.values()]
    let skipObjects = new Set<string>()

    // If remote branch is present, look for a common merge base.
    if (oldoid !== '0000000000000000000000000000000000000000') {
      // trick to speed up common force push scenarios
      const mergebase = await _findMergeBase({
        fs,
        cache,
        gitdir,
        oids: [oid, oldoid],
      })
      for (const oid of mergebase) finish.push(oid)
      if (thinPack) {
        skipObjects = await listObjects({ fs, cache, dir, gitdir, oids: mergebase })
      }
    }

    // If remote does not have the commit, figure out the objects to send
    if (!finish.includes(oid)) {
      const commits = await listCommitsAndTags({
        fs, cache, dir, gitdir, start: [oid], finish,
      })
      objects = await listObjects({ fs, cache, dir, gitdir, oids: commits })
    }

    if (thinPack) {
      // If there's a default branch for the remote lets skip those objects too.
      // Since this is an optional optimization, we just catch and continue if there is
      // an error (because we can't find a default branch, or can't find a commit, etc)
      try {
        // Sadly, the discovery phase with 'forPush' doesn't return symrefs, so we have to
        // rely on existing ones.
        const ref = await GitRefManager.resolve({
          fs,
          gitdir,
          ref: `refs/remotes/${remote}/HEAD`,
          depth: 2,
        })
        const { oid } = await GitRefManager.resolveAgainstMap({
          ref: ref.replace(`refs/remotes/${remote}/`, ''),
          fullref: ref,
          map: httpRemote.refs,
        })
        const oids = [oid]
        for (const oid of await listObjects({ fs, cache, dir, gitdir, oids })) {
          skipObjects.add(oid)
        }
      } catch (e) {}

      // Remove objects that we know the remote already has
      for (const oid of skipObjects) {
        objects.delete(oid)
      }
    }

    if (!force) {
      // Is it a tag that already exists?
      if (
        fullRef.startsWith('refs/tags') &&
        oldoid !== '0000000000000000000000000000000000000000'
      ) {
        throw new PushRejectedError('tag-exists')
      }
      // Is it a non-fast-forward commit?
      if (
        oid !== '0000000000000000000000000000000000000000' &&
        oldoid !== '0000000000000000000000000000000000000000' &&
        !(await _isDescendent({
          fs,
          cache,
          gitdir,
          oid,
          ancestor: oldoid,
          depth: -1,
        }))
      ) {
        throw new PushRejectedError('not-fast-forward')
      }
    }
  }
  // We can only safely use capabilities that the server also understands.
  // For instance, AWS CodeCommit aborts a push if you include the `agent`!!!
  const capabilities = filterCapabilities(
    [...httpRemote.capabilities],
    ['report-status', 'side-band-64k', `agent=${pkg.agent}`]
  )
  const packstream1 = await writeReceivePackRequest({
    capabilities,
    triplets: [{ oldoid, oid, fullRef: fullRemoteRef }],
  })
  const packstream2 = _delete ? [] : await _pack({ fs, cache, dir, gitdir, oids: [...objects] })
  const res = await GitRemoteHTTP.connect({
    http,
    onProgress,
    service: 'git-receive-pack',
    url,
    auth,
    headers,
    body: [...packstream1, ...packstream2],
  })
  const { packfile, progress } = await GitSideBand.demux(res.body!)
  if (onMessage) {
    const lines = splitLines(progress)
    forAwait(lines, async line => {
      await onMessage(line)
    })
  }
  // Parse the response!
  const result = await parseReceivePackResponse(packfile)
  if (res.headers) {
    result.headers = res.headers
  }

  // Update the local copy of the remote ref
  if (remote && result.ok && result.refs[fullRemoteRef].ok) {
    // TODO: I think this should actually be using a refspec transform rather than assuming 'refs/remotes/{remote}'
    const ref = `refs/remotes/${remote}/${fullRemoteRef.replace(
      'refs/heads',
      ''
    )}`

    if (_delete) {
      await GitRefManager.deleteRef({ fs, gitdir, ref })
    } else {
      await GitRefManager.writeRef({ fs, gitdir, ref, value: oid })
    }
  }

  if (result.ok && Object.values(result.refs).every(result => result.ok)) {
    return result
  } else {
    const prettyDetails = Object.entries(result.refs)
      .filter(([k, v]) => !v.ok)
      .map(([k, v]) => `\n  - ${k}: ${v.error}`)
      .join('')
    throw new GitPushError(prettyDetails, result)
  }
}
