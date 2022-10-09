import { Buffer } from 'buffer'

import { FileSystem } from '../models/FileSystem'
import { BlobMergeCallback, BlobMergeCallbackParams, Cache, WalkerEntry } from '../models'
import { TREE } from '../commands/TREE'
import { _walk } from '../commands/walk'
import { MergeNotSupportedError } from '../errors/MergeNotSupportedError'
import { GitTree } from '../models/GitTree'
import { _writeObject as writeObject } from '../storage/writeObject'

import { basename } from './basename'
import { isBinary } from './isBinary'
import { join } from './join'
import { mergeFile } from './mergeFile'

type MergeTreeParams = {
  /** A file system helper. */
  fs: FileSystem

  /** A cache object. */
  cache: Cache

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** The SHA-1 object id of our tree. */
  ourOid: string

  /** The SHA-1 object id of the base tree. */
  baseOid: string

  /** The SHA-1 object id of their tree. */
  theirOid: string

  /** The name to use in conflicted files for our hunks. */
  ourName?: string

  /** The name to use in conflicted files (in diff3 format) for the base hunks. */
  baseName?: string

  /** The name to use in conflicted files for their hunks. */
  theirName?: string

  /** If true, simulates a merge so you can test whether it would succeed. */
  dryRun?: boolean

  /** Optional blob merge callback. */
  onBlobMerge?: BlobMergeCallback
}

type MergeBlobsParams = {
  fs: FileSystem
  gitdir: string
  path: string
  filepath: string
  ours: WalkerEntry
  base: WalkerEntry
  theirs: WalkerEntry
  ourName: string
  theirName: string
  baseName: string
  dryRun?: boolean
  onBlobMerge?: BlobMergeCallback
}

/**
 * Create a merged tree
 *
 * @param args
 *
 * @returns - The SHA-1 object id of the merged tree
 *
 * @internal
 */
export async function mergeTree({
  fs,
  cache,
  dir,
  gitdir = join(dir, '.git'),
  ourOid,
  baseOid,
  theirOid,
  ourName = 'ours',
  baseName = 'base',
  theirName = 'theirs',
  dryRun = false,
  onBlobMerge,
}: MergeTreeParams): Promise<string> {
  const ourTree = TREE({ ref: ourOid })
  const baseTree = TREE({ ref: baseOid })
  const theirTree = TREE({ ref: theirOid })

  const results = await _walk({
    fs,
    cache,
    dir,
    gitdir,
    trees: [ourTree, baseTree, theirTree],
    map: async function(filepath, [ours, base, theirs]) {
      const path = basename(filepath)
      // What we did, what they did
      const ourChange = await modified(ours, base)
      const theirChange = await modified(theirs, base)

      switch (`${ourChange}-${theirChange}`) {
        case 'false-false': {
          return {
            mode: await base.mode(),
            path,
            oid: await base.oid(),
            type: await base.type(),
          }
        }
        case 'false-true': {
          return theirs
            ? {
                mode: await theirs.mode(),
                path,
                oid: await theirs.oid(),
                type: await theirs.type(),
              }
            : undefined
        }
        case 'true-false': {
          return ours
            ? {
                mode: await ours.mode(),
                path,
                oid: await ours.oid(),
                type: await ours.type(),
              }
            : undefined
        }
        case 'true-true': {
          if (
            (ours && (await ours.type()) !== 'blob') ||
            (base && (await base.type()) !== 'blob') ||
            (theirs && (await theirs.type()) !== 'blob')
          ) {
            throw new MergeNotSupportedError()
          }

          // Modifications
          return mergeBlobs({
            fs,
            gitdir,
            path,
            filepath,
            ours,
            base,
            theirs,
            ourName,
            baseName,
            theirName,
            onBlobMerge,
          })
        }
      }
    },
    /**
     * @param {TreeEntry} [parent]
     * @param {Array<TreeEntry>} children
     */
    reduce: async (parent, children) => {
      const entries = children.filter(Boolean) // remove undefineds

      // if the parent was deleted, the children have to go
      if (!parent) return

      // automatically delete directories if they have been emptied
      if (parent && parent.type === 'tree' && entries.length === 0) return

      if (entries.length > 0) {
        const tree = new GitTree(entries)
        const object = tree.toObject()
        const oid = await writeObject({
          fs,
          gitdir,
          type: 'tree',
          object,
          dryRun,
        })
        parent.oid = oid
      }
      return parent
    },
  })
  return results.oid
}

/**
 *
 * @param {WalkerEntry} entry
 * @param {WalkerEntry} base
 *
 */
async function modified(entry: WalkerEntry, base: WalkerEntry) {
  if (!entry && !base) return false
  if (entry && !base) return true
  if (!entry && base) return true
  if ((await entry.type()) === 'tree' && (await base.type()) === 'tree') {
    return false
  }
  if (
    (await entry.type()) === (await base.type()) &&
    (await entry.mode()) === (await base.mode()) &&
    (await entry.oid()) === (await base.oid())
  ) {
    return false
  }
  return true
}

/**
 *
 * @param {Object} args
 * @param {import('../models/FileSystem').FileSystem} args.fs
 * @param {string} args.gitdir
 * @param {string} args.path
 * @param {string} args.filepath
 * @param {WalkerEntry | null} args.ours
 * @param {WalkerEntry | null} args.base
 * @param {WalkerEntry | null} args.theirs
 * @param {string} [args.ourName]
 * @param {string} [args.baseName]
 * @param {string} [args.theirName]
 * @param {string} [args.format]
 * @param {number} [args.markerSize]
 * @param {boolean} [args.dryRun = false]
 * @param {BlobMergeCallback} [args.onBlobMerge]
 */
async function mergeBlobs({
  fs,
  gitdir,
  path,
  filepath,
  ours,
  base,
  theirs,
  ourName,
  theirName,
  baseName,
  dryRun,
  onBlobMerge,
}: MergeBlobsParams) {
  const type = 'blob'

  // if both sides were deleted
  if (ours === null && theirs === null) {
    return undefined
  }

  // The trivial case: nothing to merge except maybe mode
  if (ours && theirs && (await ours.oid()) === (await theirs.oid())) {
    return { mode: await ours.mode(), path, oid: await ours.oid(), type }
  }

  if (base && ours && theirs) {
    // Compute the new mode.
    // Since there are ONLY two valid blob modes ('100755' and '100644') it boils down to this
    const mode =
      (await base.mode()) === (await ours.mode())
        ? await theirs.mode()
        : await ours.mode()

    // if only one side made oid changes, return that side's oid
    if ((await ours.oid()) === (await base.oid())) {
      return { mode, path, oid: await theirs.oid(), type }
    }

    if ((await theirs.oid()) === (await base.oid())) {
      return { mode, path, oid: await ours.oid(), type }
    }
  }

  const blobMergeCallback = onBlobMerge || defaultBlobMergeCallback
  const blobMergeResult = await blobMergeCallback({
    filePath: filepath,
    theirBlob: theirs,
    baseBlob: base,
    ourBlob: ours,
    theirName: theirName,
    baseName: baseName,
    ourName: ourName
  })

  if (!blobMergeResult) return undefined

  const { oid, mode } =
    'mergedText' in blobMergeResult
      ? {
          oid: await writeObject({
            fs,
            gitdir,
            type: 'blob',
            object: Buffer.from(blobMergeResult.mergedText, 'utf8'),
            dryRun,
          }),
          mode: blobMergeResult.mode,
        }
      : {
          oid: blobMergeResult.oid,
          mode: blobMergeResult.mode,
        }

  return { mode, path, oid, type }
}

async function defaultBlobMergeCallback({
  filePath,
  theirBlob: their,
  baseBlob: base,
  ourBlob: our,
  theirName,
  baseName,
  ourName
}: BlobMergeCallbackParams) {
  if (base && our && their) {
    const ourContent = await our.content()
    const baseContent = await base.content()
    const theirContent = await their.content()

    if (
      !ourContent ||
      isBinary(ourContent) ||
      !baseContent ||
      isBinary(baseContent) ||
      !theirContent ||
      isBinary(theirContent)
    ) {
      throw new MergeNotSupportedError('Merge of binary data is not supported.')
    }

    // if both sides made changes do a merge
    const { mergedText, cleanMerge } = mergeFile({
      ourContent: Buffer.from(ourContent).toString('utf8'),
      baseContent: Buffer.from(baseContent).toString('utf8'),
      theirContent: Buffer.from(theirContent).toString('utf8'),
      ourName,
      theirName,
      baseName,
    })

    if (!cleanMerge) {
      // all other types of conflicts fail
      throw new MergeNotSupportedError('Merge with conflicts is not supported.')
    }

    const mode =
      (await base.mode()) === (await our.mode())
        ? await their.mode()
        : await our.mode()
    return { mergedText: mergedText, mode: mode }
  } else {
    throw new MergeNotSupportedError()
  }
}
