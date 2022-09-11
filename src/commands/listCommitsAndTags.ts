import { FileSystem } from '../models/FileSystem'
import { ObjectTypeError } from '../errors/ObjectTypeError'
import { GitRefManager } from '../managers/GitRefManager'
import { GitShallowManager } from '../managers/GitShallowManager'
import { GitAnnotatedTag } from '../models/GitAnnotatedTag'
import { GitCommit } from '../models/GitCommit'
import { _readObject as readObject } from '../storage/readObject'
import { join } from '../utils/join'
import { Cache } from '../models'

type ListCommitsAndTagsParams = {
  fs: FileSystem
  cache: Cache
  dir: string
  gitdir?: string
  start: Iterable<string>
  finish: Iterable<string>
}

/**
 * @param {object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {any} args.cache
 * @param {string} [args.dir]
 * @param {string} args.gitdir
 * @param {Iterable<string>} args.start
 * @param {Iterable<string>} args.finish
 * @returns {Promise<Set<string>>}
 */
export async function listCommitsAndTags({
  fs,
  cache,
  dir,
  gitdir = join(dir, '.git'),
  start,
  finish,
}: ListCommitsAndTagsParams): Promise<Set<string>> {
  const shallows = await GitShallowManager.read({ fs, gitdir })
  const startingSet = new Set<string>()
  const finishingSet = new Set<string>()

  for (const ref of start) {
    startingSet.add(await GitRefManager.resolve({ fs, gitdir, ref }))
  }

  for (const ref of finish) {
    // We may not have these refs locally so we must try/catch
    try {
      const oid = await GitRefManager.resolve({ fs, gitdir, ref })
      finishingSet.add(oid)
    } catch (err) {}
  }

  const visited = new Set<string>()
  // Because git commits are named by their hash, there is no
  // way to construct a cycle. Therefore we won't worry about
  // setting a default recursion limit.
  async function walk(oid: string): Promise<void> {
    visited.add(oid)
    const { type, object } = await readObject({ fs, cache, gitdir, oid })

    // Recursively resolve annotated tags
    if (type === 'tag') {
      const tag = GitAnnotatedTag.from(object)
      const commit = tag.headers().object
      return walk(commit)
    }

    if (type !== 'commit') {
      throw new ObjectTypeError(oid, type, 'commit')
    }

    if (!shallows.has(oid)) {
      const commit = GitCommit.from(object)
      const parents = commit.headers().parent
      for (oid of parents) {
        if (!finishingSet.has(oid) && !visited.has(oid)) {
          await walk(oid)
        }
      }
    }
  }

  // Let's go walking!
  for (const oid of startingSet) {
    await walk(oid)
  }

  return visited
}
