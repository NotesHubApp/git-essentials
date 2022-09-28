import ignore from 'ignore'

import { FileSystem } from '../models/FileSystem'
import { basename } from '../utils/basename'
import { dirname } from '../utils/dirname'
import { join } from '../utils/join'

// I'm putting this in a Manager because I reckon it could benefit
// from a LOT of cacheing.
type GitIgnoreManagerParams = {
  fs: FileSystem
  dir: string
  gitdir: string
  filepath: string
}

export class GitIgnoreManager {
  static async isIgnored({ fs, dir, gitdir = join(dir, '.git'), filepath }: GitIgnoreManagerParams): Promise<boolean> {
    // ALWAYS ignore ".git" folders.
    if (basename(filepath) === '.git') return true
    // '.' is not a valid gitignore entry, so '.' is never ignored
    if (filepath === '.') return false
    // Check and load exclusion rules from project exclude file (.git/info/exclude)
    let excludes = ''
    const excludesFile = join(gitdir, 'info', 'exclude')
    if (await fs.exists(excludesFile)) {
      excludes = <string>await fs.read(excludesFile, { encoding: 'utf8' })
    }
    // Find all the .gitignore files that could affect this file
    const pairs = [
      {
        gitignore: join(dir, '.gitignore'),
        filepath,
      },
    ]
    const pieces = filepath.split('/')
    for (let i = 1; i < pieces.length; i++) {
      const folder = pieces.slice(0, i).join('/')
      const file = pieces.slice(i).join('/')
      pairs.push({
        gitignore: join(dir, folder, '.gitignore'),
        filepath: file,
      })
    }

    let ignoredStatus = false

    for (const p of pairs) {
      try {
        const file = <string>await fs.read(p.gitignore, { encoding: 'utf8'})

        const ign = ignore().add(excludes)
        ign.add(file)
        // If the parent directory is excluded, we are done.
        // "It is not possible to re-include a file if a parent directory of that file is excluded. Git doesn’t list excluded directories for performance reasons, so any patterns on contained files have no effect, no matter where they are defined."
        // source: https://git-scm.com/docs/gitignore
        const parentdir = dirname(p.filepath)
        if (parentdir !== '.' && ign.ignores(parentdir)) return true
        // If the file is currently ignored, test for UNignoring.
        if (ignoredStatus) {
          ignoredStatus = !ign.test(p.filepath).unignored
        } else {
          ignoredStatus = ign.test(p.filepath).ignored
        }
      } catch (err: any) {
        if (err.code === 'NOENT') continue
        throw err
      }
    }

    return ignoredStatus
  }
}
