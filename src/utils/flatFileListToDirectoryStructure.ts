import { Stats } from '../models'
import { IndexEntry } from '../models/IndexEntry'
import { basename } from '../utils/basename'
import { dirname } from '../utils/dirname'


type Metadata = Partial<Stats> & {
  oid?: string
}

/** @internal */
export type Node = {
  type: 'blob' | 'tree',
  fullpath: string,
  basename: string,
  metadata: Metadata,
  parent?: Node,
  children: Array<Node>
}

/** @internal */
export function flatFileListToDirectoryStructure(files: IndexEntry[]) {
  const inodes = new Map<string, Node>()

  const mkdir = function(name: string) {
    if (!inodes.has(name)) {
      const dir: Node = {
        type: 'tree',
        fullpath: name,
        basename: basename(name),
        metadata: {},
        children: [],
      }

      inodes.set(name, dir)
      // This recursively generates any missing parent folders.
      // We do it after we've added the inode to the set so that
      // we don't recurse infinitely trying to create the root '.' dirname.
      dir.parent = mkdir(dirname(name))
      if (dir.parent && dir.parent !== dir) dir.parent.children.push(dir)
    }

    return inodes.get(name)
  }

  const mkfile = function(name: string, metadata: Metadata) {
    if (!inodes.has(name)) {
      const file: Node = {
        type: 'blob',
        fullpath: name,
        basename: basename(name),
        metadata: metadata,
        // This recursively generates any missing parent folders.
        parent: mkdir(dirname(name)),
        children: [],
      }

      if (file.parent) file.parent.children.push(file)
      inodes.set(name, file)
    }

    return inodes.get(name)
  }

  mkdir('.')
  for (const file of files) {
    mkfile(file.path, file)
  }

  return inodes
}
