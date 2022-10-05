import { Buffer } from 'buffer'

import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { _currentBranch } from '../commands/currentBranch'
import { MissingParameterError } from '../errors/MissingParameterError'
import { RemoteCapabilityError } from '../errors/RemoteCapabilityError'
import { GitConfigManager } from '../managers/GitConfigManager'
import { GitRefManager } from '../managers/GitRefManager'
import { GitRemoteManager } from '../managers/GitRemoteManager'
import { GitShallowManager } from '../managers/GitShallowManager'
import { GitCommit } from '../models/GitCommit'
import { GitPackIndex } from '../models/GitPackIndex'
import { hasObject } from '../storage/hasObject'
import { _readObject as readObject } from '../storage/readObject'
import { abbreviateRef } from '../utils/abbreviateRef'
import { collect } from '../utils/collect'
import { emptyPackfile } from '../utils/emptyPackfile'
import { filterCapabilities } from '../utils/filterCapabilities'
import { join } from '../utils/join'
import { getGitClientAgent } from '../utils/pkg'
import { splitLines } from '../utils/splitLines'
import { parseUploadPackResponse } from '../wire/parseUploadPackResponse'
import { writeUploadPackRequest } from '../wire/writeUploadPackRequest'
import { forAwait } from '../utils/forAwait'
import {
  AuthCallback,
  AuthFailureCallback,
  AuthSuccessCallback,
  HttpClient,
  HttpHeaders,
  MessageCallback,
  ProgressCallback
} from '../models'


type FetchParams = {
  fs: FileSystem
  http: HttpClient
  onProgress?: ProgressCallback
  onMessage?: MessageCallback
  onAuth?: AuthCallback
  onAuthSuccess?: AuthSuccessCallback
  onAuthFailure?: AuthFailureCallback
  gitdir: string
  ref?: string
  remoteRef?: string
  remote?: string
  url?: string | void
  depth?: number | null,
  since?: Date | null,
  exclude?: string[]
  relative?: boolean
  tags?: boolean
  singleBranch?: boolean
  headers?: HttpHeaders
  prune?: boolean
  pruneTags?: boolean
  cache: Cache
}

/**
 * Fetch result object.
 */
export type FetchResult = {
  /** The branch that is cloned if no branch is specified. */
  defaultBranch: string | null

  /** The SHA-1 object id of the fetched head commit. */
  fetchHead: string | null

  /** A textual description of the branch that was fetched. */
  fetchHeadDescription: string | null

  /** The HTTP response headers returned by the git server. */
  headers?: HttpHeaders

  /** A list of branches that were pruned, if you provided the `prune` parameter. */
  pruned?: string[]

  packfile?: string
}

/**
 * @param {FetchParams} args
 * @returns {Promise<FetchResult>}
 * @see FetchResult
 * @internal
 */
export async function _fetch({
  fs,
  cache,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  gitdir,
  ref: _ref,
  remoteRef: _remoteRef,
  remote: _remote,
  url: _url,
  depth = null,
  since = null,
  exclude = [],
  relative = false,
  tags = false,
  singleBranch = false,
  headers = {},
  prune = false,
  pruneTags = false,
}: FetchParams): Promise<FetchResult> {
  const ref = _ref || (await _currentBranch({ fs, gitdir, test: true }))!
  const config = await GitConfigManager.get({ fs, gitdir })
  // Figure out what remote to use.
  const remote =
    _remote || (ref && config.get(`branch.${ref}.remote`)) || 'origin'
  // Lookup the URL for the given remote.
  const url = _url || config.get(`remote.${remote}.url`)
  if (typeof url === 'undefined') {
    throw new MissingParameterError('remote OR url')
  }
  // Figure out what remote ref to use.
  const remoteRef =
    _remoteRef ||
    (ref && config.get(`branch.${ref}.merge`)) ||
    _ref ||
    'HEAD'

  const GitRemoteHTTP = GitRemoteManager.getRemoteHelperFor({ url })
  const remoteHTTP = await GitRemoteHTTP.discover({
    http,
    onAuth,
    onAuthSuccess,
    onAuthFailure,
    service: 'git-upload-pack',
    url,
    headers,
    protocolVersion: 1,
  })
  const auth = remoteHTTP.auth // hack to get new credentials from CredentialManager API
  const remoteRefs = remoteHTTP.refs
  // For the special case of an empty repository with no refs, return null.
  if (remoteRefs.size === 0) {
    return {
      defaultBranch: null,
      fetchHead: null,
      fetchHeadDescription: null,
    }
  }
  // Check that the remote supports the requested features
  if (depth !== null && !remoteHTTP.capabilities.has('shallow')) {
    throw new RemoteCapabilityError('shallow', 'depth')
  }
  if (since !== null && !remoteHTTP.capabilities.has('deepen-since')) {
    throw new RemoteCapabilityError('deepen-since', 'since')
  }
  if (exclude.length > 0 && !remoteHTTP.capabilities.has('deepen-not')) {
    throw new RemoteCapabilityError('deepen-not', 'exclude')
  }
  if (relative === true && !remoteHTTP.capabilities.has('deepen-relative')) {
    throw new RemoteCapabilityError('deepen-relative', 'relative')
  }
  // Figure out the SHA for the requested ref
  const { oid, fullref } = GitRefManager.resolveAgainstMap({
    ref: remoteRef,
    map: remoteRefs,
  })
  // Filter out refs we want to ignore: only keep ref we're cloning, HEAD, branches, and tags (if we're keeping them)
  for (const remoteRef of remoteRefs.keys()) {
    if (
      remoteRef === fullref ||
      remoteRef === 'HEAD' ||
      remoteRef.startsWith('refs/heads/') ||
      (tags && remoteRef.startsWith('refs/tags/'))
    ) {
      continue
    }
    remoteRefs.delete(remoteRef)
  }
  // Assemble the application/x-git-upload-pack-request
  const capabilities = filterCapabilities(
    [...remoteHTTP.capabilities],
    [
      'multi_ack_detailed',
      'no-done',
      'side-band-64k',
      // Note: I removed 'thin-pack' option since our code doesn't "fatten" packfiles,
      // which is necessary for compatibility with git. It was the cause of mysterious
      // 'fatal: pack has [x] unresolved deltas' errors that plagued us for some time.
      // isomorphic-git is perfectly happy with thin packfiles in .git/objects/pack but
      // canonical git it turns out is NOT.
      'ofs-delta',
      `agent=${getGitClientAgent()}`,
    ]
  )
  if (relative) capabilities.push('deepen-relative')
  // Start figuring out which oids from the remote we want to request
  const wants = singleBranch ? [oid] : remoteRefs.values()
  // Come up with a reasonable list of oids to tell the remote we already have
  // (preferably oids that are close ancestors of the branch heads we're fetching)
  const haveRefs = singleBranch
    ? [ref, `${remote}/${ref}`]
    : await GitRefManager.listRefs({
        fs,
        gitdir,
        filepath: `refs`,
      })
  let haves = []
  for (let ref of haveRefs) {
    try {
      ref = await GitRefManager.expand({ fs, gitdir, ref })
      const oid = await GitRefManager.resolve({ fs, gitdir, ref })
      if (await hasObject({ fs, cache, gitdir, oid })) {
        haves.push(oid)
      }
    } catch (err) {}
  }
  haves = [...new Set(haves)]
  const oids = await GitShallowManager.read({ fs, gitdir })
  const shallows = remoteHTTP.capabilities.has('shallow') ? [...oids] : []
  const packstream = writeUploadPackRequest({
    capabilities,
    wants,
    haves,
    shallows,
    depth,
    since,
    exclude,
  })
  // CodeCommit will hang up if we don't send a Content-Length header
  // so we can't stream the body.
  const packbuffer = Buffer.from(await collect(packstream))
  const raw = await GitRemoteHTTP.connect({
    http,
    onProgress,
    service: 'git-upload-pack',
    url,
    auth,
    body: [packbuffer],
    headers,
  })

  let responseHeaders: HttpHeaders | undefined
  const response = await parseUploadPackResponse(raw.body!)
  if (raw.headers) {
    responseHeaders = raw.headers
  }

  // Apply all the 'shallow' and 'unshallow' commands
  for (const oid of response.shallows) {
    if (!oids.has(oid)) {
      // this is in a try/catch mostly because my old test fixtures are missing objects
      try {
        // server says it's shallow, but do we have the parents?
        const { object } = await readObject({ fs, cache, gitdir, oid })
        const commit = new GitCommit(object)
        const hasParents = await Promise.all(
          commit.headers().parent.map(oid => hasObject({ fs, cache, gitdir, oid }))
        )
        const haveAllParents =
          hasParents.length === 0 || hasParents.every(has => has)
        if (!haveAllParents) {
          oids.add(oid)
        }
      } catch (err) {
        oids.add(oid)
      }
    }
  }

  for (const oid of response.unshallows) {
    oids.delete(oid)
  }

  await GitShallowManager.write({ fs, gitdir, oids })

  let pruned: string[] = []

  // Update local remote refs
  if (singleBranch) {
    const refs = new Map<string, string>([[fullref, oid]])
    // But wait, maybe it was a symref, like 'HEAD'!
    // We need to save all the refs in the symref chain (sigh).
    const symrefs = new Map<string, string>()
    let bail = 10
    let key = fullref
    while (bail--) {
      const value = remoteHTTP.symrefs.get(key)
      if (value === undefined) break
      symrefs.set(key, value)
      key = value
    }
    // final value must not be a symref but a real ref
    const realRef = remoteRefs.get(key)
    // There may be no ref at all if we've fetched a specific commit hash
    if (realRef) {
      refs.set(key, realRef)
    }

    const result = await GitRefManager.updateRemoteRefs({
      fs,
      gitdir,
      remote,
      refs,
      symrefs,
      tags,
      prune,
    })

    if (prune) {
      pruned = result.pruned
    }
  } else {
    const result = await GitRefManager.updateRemoteRefs({
      fs,
      gitdir,
      remote,
      refs: remoteRefs,
      symrefs: remoteHTTP.symrefs,
      tags,
      prune,
      pruneTags,
    })

    if (prune) {
      pruned = result.pruned
    }
  }

  // We need this value later for the `clone` command.
  let HEAD = remoteHTTP.symrefs.get('HEAD')
  // AWS CodeCommit doesn't list HEAD as a symref, but we can reverse engineer it
  // Find the SHA of the branch called HEAD
  if (HEAD === undefined) {
    const { oid } = GitRefManager.resolveAgainstMap({
      ref: 'HEAD',
      map: remoteRefs,
    })
    // Use the name of the first branch that's not called HEAD that has
    // the same SHA as the branch called HEAD.
    for (const [key, value] of remoteRefs.entries()) {
      if (key !== 'HEAD' && value === oid) {
        HEAD = key
        break
      }
    }
  }

  const noun = fullref.startsWith('refs/tags') ? 'tag' : 'branch'
  const FETCH_HEAD = {
    oid,
    description: `${noun} '${abbreviateRef(fullref)}' of ${url}`,
  }

  if (onProgress || onMessage) {
    const lines = splitLines(response.progress)
    forAwait<string>(lines, async line => {
      if (onMessage) await onMessage(line)
      if (onProgress) {
        const matches = line.match(/([^:]*).*\((\d+?)\/(\d+?)\)/)
        if (matches) {
          await onProgress({
            phase: matches[1].trim(),
            loaded: parseInt(matches[2], 10),
            total: parseInt(matches[3], 10),
          })
        }
      }
    })
  }

  const packfile = Buffer.from(await collect(response.packfile))
  const packfileSha = packfile.slice(-20).toString('hex')

  const res: FetchResult = {
    defaultBranch: HEAD ?? null,
    fetchHead: FETCH_HEAD.oid,
    fetchHeadDescription: FETCH_HEAD.description
  }

  if (responseHeaders) {
    res.headers = responseHeaders
  }

  if (prune) {
    res.pruned = pruned
  }

  // This is a quick fix for the empty .git/objects/pack/pack-.pack file error,
  // which due to the way `git-list-pack` works causes the program to hang when it tries to read it.
  // TODO: Longer term, we should actually:
  // a) NOT concatenate the entire packfile into memory (line 78),
  // b) compute the SHA of the stream except for the last 20 bytes, using the same library used in push.ts, and
  // c) compare the computed SHA with the last 20 bytes of the stream before saving to disk, and throwing a "packfile got corrupted during download" error if the SHA doesn't match.
  if (packfileSha !== '' && !emptyPackfile(packfile)) {
    res.packfile = `objects/pack/pack-${packfileSha}.pack`
    const fullpath = join(gitdir, res.packfile)
    await fs.write(fullpath, packfile)
    const getExternalRefDelta = (oid: string) => readObject({ fs, cache, gitdir, oid })
    const idx = await GitPackIndex.fromPack({
      pack: packfile,
      getExternalRefDelta,
      onProgress,
    })
    await fs.write(fullpath.replace(/\.pack$/, '.idx'), await idx.toBuffer())
  }

  return res
}
