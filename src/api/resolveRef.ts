import { GitRefManager } from '../managers/GitRefManager'
import { FsClient } from '../models'
import { FileSystem } from '../models/FileSystem'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


export type ResolveRefParams = {
  /** A file system client. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `{dir}/.git`). */
  gitdir?: string

  /** The ref to resolve. */
  ref: string

  /** How many symbolic references to follow before returning. */
  depth?: number
}

/**
 * Get the value of a symbolic ref or resolve a ref to its SHA-1 object id.
 *
 * @param args
 *
 * @returns Resolves successfully with a SHA-1 object id or the value of a symbolic ref
 *
 * @example
 * const currentCommit = await resolveRef({ fs, dir: '/tutorial', ref: 'HEAD' })
 * console.log(currentCommit)
 * const currentBranch = await resolveRef({ fs, dir: '/tutorial', ref: 'HEAD', depth: 2 })
 * console.log(currentBranch)
 *
 */
export async function resolveRef(
  { fs, dir, gitdir = join(dir, '.git'), ref, depth }: ResolveRefParams): Promise<string> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)
    assertParameter('ref', ref)

    const oid = await GitRefManager.resolve({
      fs: new FileSystem(fs),
      gitdir,
      ref,
      depth,
    })
    return oid
  } catch (err: any) {
    err.caller = 'git.resolveRef'
    throw err
  }
}
