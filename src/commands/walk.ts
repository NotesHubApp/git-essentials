import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { GitWalkSymbol, Walker, WalkerEntry } from '../models/Walker'
import { arrayRange } from '../utils/arrayRange'
import { unionOfIterators } from '../utils/unionOfIterators'

type WalkerMap = (filename: string, entries: WalkerEntry[]) => Promise<any>
type WalkerReduce = (parent: any, children: any[]) => Promise<any>
type WalkerIterateCallback = (entries: (WalkerEntry | string | null)[]) => Promise<any[] | void>
type WalkerIterate = (walk: WalkerIterateCallback, children: IterableIterator<(WalkerEntry | string | null)[]>) => Promise<any[]>

type WalkParams = {
  fs: FileSystem
  cache: Cache
  dir: string
  gitdir: string
  trees: Walker[]
  map?: WalkerMap
  reduce?: WalkerReduce
  iterate?: WalkerIterate
}

/**
 * @param {object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {object} args.cache
 * @param {string} [args.dir]
 * @param {string} [args.gitdir=join(dir,'.git')]
 * @param {Walker[]} args.trees
 * @param {WalkerMap} [args.map]
 * @param {WalkerReduce} [args.reduce]
 * @param {WalkerIterate} [args.iterate]
 *
 * @returns {Promise<any>} The finished tree-walking result
 *
 * @see {WalkerMap}
 *
 */
export async function _walk({
  fs,
  cache,
  dir,
  gitdir,
  trees,
  // @ts-ignore
  map = async (_, entry) => entry,
  // The default reducer is a flatmap that filters out undefineds.
  reduce = async (parent, children) => {
    const flatten = children.flat()
    if (parent !== undefined) flatten.unshift(parent)
    return flatten
  },
  // The default iterate function walks all children concurrently
  iterate = (walk, children) => Promise.all([...children].map(walk))
}: WalkParams): Promise<any> {
  const walkers = trees.map(proxy =>
    proxy[GitWalkSymbol]({ fs, dir, gitdir, cache })
  )

  const root = new Array<string>(walkers.length).fill('.')
  const range = arrayRange(0, walkers.length)

  const unionWalkerFromReaddir = async (entries: (string | WalkerEntry | null)[]) => {
    range.map(i => {
      entries[i] = entries[i] && new walkers[i].ConstructEntry(entries[i] as string)
    })
    const subdirs = await Promise.all(
      range.map(i => (entries[i] ? walkers[i].readdir(entries[i] as WalkerEntry) as Promise<string[]> : [] as string[]))
    )
    // Now process child directories
    const iterators = subdirs
      .map(array => (array === null ? [] as string[] : array))
      .map(array => array[Symbol.iterator]())
    return {
      entries: entries as WalkerEntry[],
      children: unionOfIterators(iterators),
    }
  }

  const walk = async (root: (string | WalkerEntry | null)[]): Promise<any[] | void> => {
    const { entries, children } = await unionWalkerFromReaddir(root)
    const fullpath = entries.find(entry => entry && entry._fullpath)!._fullpath
    const parent = await map(fullpath, entries)
    if (parent !== null) {
      let walkedChildren = await iterate(walk, children)
      walkedChildren = walkedChildren.filter(x => x !== undefined)
      return reduce(parent, walkedChildren)
    }
  }

  return walk(root)
}
