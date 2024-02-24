import { ReadCommitResult, _readCommit } from '../commands/readCommit'

import { Cache } from '../models/Cache'
import { FileSystem } from '../models/FileSystem'
import { GitRefManager } from '../managers/GitRefManager'
import { GitShallowManager } from '../managers/GitShallowManager'
import { NotFoundError } from '../errors'
import { compareAge } from '../utils/compareAge'
import { resolveFileIdInTree } from '../utils/resolveFileIdInTree'
import { resolveFilepath } from '../utils/resolveFilepath'

type LogParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  ref: string
  depth?: number
  since?: Date
  filepath?: string
  force?: boolean,
  follow?: boolean,
}

/**
 * Get commit descriptions from the git history.
 *
 * @internal
 */
export async function _log({
  fs,
  cache,
  gitdir,
  ref,
  depth,
  since,
  filepath,
  force,
  follow
}: LogParams): Promise<Array<ReadCommitResult>> {
  const sinceTimestamp =
    typeof since === 'undefined'
      ? undefined
      : Math.floor(since.valueOf() / 1000)
  // TODO: In the future, we may want to have an API where we return a
  // async iterator that emits commits.
  const commits: ReadCommitResult[] = []
  const shallowCommits = await GitShallowManager.read({ fs, gitdir })
  const oid = await GitRefManager.resolve({ fs, gitdir, ref })
  const tips = [await _readCommit({ fs, cache, gitdir, oid })]
  let lastFileOid: string | undefined = undefined
  let lastCommit: ReadCommitResult | undefined = undefined
  let isOk: boolean | undefined = undefined

  function endCommit(commit: ReadCommitResult) {
    if (isOk && filepath) commits.push(commit)
  }

  while (tips.length > 0) {
    const commit = tips.pop()!

    // Stop the log if we've hit the age limit
    if (
      sinceTimestamp !== undefined &&
      commit.commit.committer.timestamp <= sinceTimestamp
    ) {
      break
    }

    if (filepath) {
      let vFileOid
      try {
        vFileOid = await resolveFilepath({
          fs,
          cache,
          gitdir,
          oid: commit.commit.tree!,
          filepath,
        })
        if (lastCommit && lastFileOid !== vFileOid) {
          commits.push(lastCommit)
        }
        lastFileOid = vFileOid
        lastCommit = commit
        isOk = true
      } catch (e) {
        if (e instanceof NotFoundError) {
          let found: string | string[] | boolean | undefined = follow && lastFileOid
          if (found) {
            found = await resolveFileIdInTree({
              fs,
              cache,
              gitdir,
              oid: commit.commit.tree!,
              fileId: lastFileOid!,
            })
            if (found) {
              if (Array.isArray(found)) {
                if (lastCommit) {
                  const lastFound = await resolveFileIdInTree({
                    fs,
                    cache,
                    gitdir,
                    oid: lastCommit.commit.tree!,
                    fileId: lastFileOid!,
                  })
                  if (Array.isArray(lastFound)) {
                    found = found.filter(p => lastFound.indexOf(p) === -1)
                    if (found.length === 1) {
                      found = found[0]
                      filepath = found
                      if (lastCommit) commits.push(lastCommit)
                    } else {
                      found = false
                      if (lastCommit) commits.push(lastCommit)
                      break
                    }
                  }
                }
              } else {
                filepath = found
                if (lastCommit) commits.push(lastCommit)
              }
            }
          }
          if (!found) {
            if (isOk && lastFileOid) {
              commits.push(lastCommit!)
              if (!force) break
            }
            if (!force && !follow) throw e
          }
          lastCommit = commit
          isOk = false
        } else throw e
      }
    } else {
      commits.push(commit)
    }

    // Stop the loop if we have enough commits now.
    if (depth !== undefined && commits.length === depth) {
      endCommit(commit)
      break
    }

    // If this is not a shallow commit...
    if (!shallowCommits.has(commit.oid)) {
      // Add the parents of this commit to the queue
      // Note: for the case of a commit with no parents, it will concat an empty array, having no net effect.
      for (const oid of commit.commit.parent!) {
        const commit = await _readCommit({ fs, cache, gitdir, oid })
        if (!tips.map(commit => commit.oid).includes(commit.oid)) {
          tips.push(commit)
        }
      }
    }

    // Stop the loop if there are no more commit parents
    if (tips.length === 0) {
      endCommit(commit)
    }

    // Process tips in order by age
    tips.sort((a, b) => compareAge(a.commit, b.commit))
  }

  return commits
}
