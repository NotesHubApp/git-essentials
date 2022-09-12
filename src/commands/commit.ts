import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { GitIndexManager } from '../managers/GitIndexManager'
import { GitRefManager } from '../managers/GitRefManager'
import { GitCommit } from '../models/GitCommit'
import { GitTree } from '../models/GitTree'
import { _writeObject as writeObject } from '../storage/writeObject'
import { flatFileListToDirectoryStructure, Node } from '../utils/flatFileListToDirectoryStructure'
import { NormalizedAuthor, SignCallback } from '../models/_common'
import { GitIndex } from '../models/GitIndex'


type CommitParams = {
  fs: FileSystem
  cache: Cache
  onSign?: SignCallback
  gitdir: string
  message: string
  author: NormalizedAuthor
  committer: NormalizedAuthor
  signingKey?: string
  dryRun?: boolean
  noUpdateBranch?: boolean
  ref: string
  parent?: string[]
  tree?: string
}

/**
 *
 * @param {Object} args
 * @param {FileSystem} args.fs
 * @param {object} args.cache
 * @param {SignCallback} [args.onSign]
 * @param {string} args.gitdir
 * @param {string} args.message
 * @param {NormalizedAuthor} args.author
 * @param {NormalizedAuthor} args.committer
 * @param {string} [args.signingKey]
 * @param {boolean} [args.dryRun = false]
 * @param {boolean} [args.noUpdateBranch = false]
 * @param {string} [args.ref]
 * @param {string[]} [args.parent]
 * @param {string} [args.tree]
 *
 * @returns {Promise<string>} Resolves successfully with the SHA-1 object id of the newly created commit.
 */
export async function _commit({
  fs,
  cache,
  onSign,
  gitdir,
  message,
  author,
  committer,
  signingKey,
  dryRun = false,
  noUpdateBranch = false,
  ref,
  parent,
  tree,
}: CommitParams): Promise<string> {
  if (!ref) {
    ref = await GitRefManager.resolve({
      fs,
      gitdir,
      ref: 'HEAD',
      depth: 2,
    })
  }

  return GitIndexManager.acquire({ fs, gitdir, cache }, async function(index: GitIndex) {
    const inodes = flatFileListToDirectoryStructure(index.entries)
    const inode = inodes.get('.')
    if (!tree) {
      tree = await constructTree({ fs, gitdir, inode: inode!, dryRun })
    }

    if (!parent) {
      try {
        parent = [ await GitRefManager.resolve({ fs, gitdir, ref }) ]
      } catch (err) {
        // Probably an initial commit
        parent = []
      }
    }

    let comm = GitCommit.from({ tree, parent, author, committer, message })

    if (signingKey && onSign) {
      comm = await GitCommit.sign(comm, onSign, signingKey)
    }

    const oid = await writeObject({
      fs,
      gitdir,
      type: 'commit',
      object: comm.toObject(),
      dryRun,
    })
    if (!noUpdateBranch && !dryRun) {
      // Update branch pointer
      await GitRefManager.writeRef({ fs, gitdir, ref, value: oid })
    }

    return oid
  })
}

type ConstructTreeParams = {
  fs: FileSystem
  gitdir: string
  inode: Node
  dryRun: boolean
}

async function constructTree({ fs, gitdir, inode, dryRun }: ConstructTreeParams) {
  // use depth first traversal
  const children = inode.children
  for (const inode of children) {
    if (inode.type === 'tree') {
      inode.metadata.mode = '040000'
      inode.metadata.oid = await constructTree({ fs, gitdir, inode, dryRun })
    }
  }

  const entries = children.map(inode => ({
    mode: inode.metadata.mode!,
    path: inode.basename,
    oid: inode.metadata.oid!,
    type: inode.type,
  }))

  const tree = GitTree.from(entries)
  const oid = await writeObject({ fs, gitdir, type: 'tree', object: tree.toObject(), dryRun })
  return oid
}
