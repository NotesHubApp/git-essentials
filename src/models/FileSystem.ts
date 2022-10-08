import { Buffer } from 'buffer'

import { compareStrings } from '../utils/compareStrings'
import { dirname } from '../utils/dirname'
import { EncodingOptions, FsClient, RmOptions, WriteOptions } from './FsClient'

/**
 * This is just a collection of helper functions really. At least that's how it started.
 * @internal
 */
export class FileSystem {
  constructor(private readonly fs: FsClient) { }

  /**
   * Return true if a file exists, false if it doesn't exist.
   * Rethrows errors that aren't related to file existance.
   */
  async exists(path: string): Promise<boolean> {
    try {
      await this.fs.stat(path)
      return true
    } catch (err: any) {
      if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
        return false
      } else {
        console.log('Unhandled error in "FileSystem.exists()" function', err)
        throw err
      }
    }
  }

  /**
   * Return the contents of a file if it exists, otherwise returns null.
   */
  async read(path: string, options: EncodingOptions = {}): Promise<Buffer | string | null> {
    try {
      let buffer = await this.fs.readFile(path, options)
      // Convert plain ArrayBuffers to Buffers
      if (typeof buffer !== 'string') {
        return Buffer.from(buffer)
      }

      return buffer
    } catch (err) {
      return null
    }
  }

  /**
   * Write a file (creating missing directories if need be) without throwing errors.
   */
  async write(path: string, contents: string | Uint8Array, options: WriteOptions = {}) {
    try {
      await this.fs.writeFile(path, contents, options)
      return
    } catch (err) {
      // Hmm. Let's try mkdirp and try again.
      await this.mkdir(dirname(path))
      await this.fs.writeFile(path, contents, options)
    }
  }

  /**
   * Make a directory (or series of nested directories) without throwing an error if it already exists.
   */
  async mkdir(path: string, _selfCall = false) {
    try {
      await this.fs.mkdir(path)
      return
    } catch (err: any) {
      // If err is null then operation succeeded!
      if (err === null) return
      // If the directory already exists, that's OK!
      if (err.code === 'EEXIST') return
      // Avoid infinite loops of failure
      if (_selfCall) throw err
      // If we got a "no such file or directory error" backup and try again.
      if (err.code === 'ENOENT') {
        const parent = dirname(path)
        // Check to see if we've gone too far
        if (parent === '.' || parent === '/' || parent === path) throw err
        // Infinite recursion, what could go wrong?
        await this.mkdir(parent)
        await this.mkdir(path, true)
      }
    }
  }

  /**
   * Delete a file without throwing an error if it is already deleted.
   */
  async rm(path: string) {
    try {
      await this.fs.unlink(path)
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err
    }
  }

  /**
   * Delete a directory or file without throwing an error if it is already deleted.
   */
  async rmdir(path: string, options: RmOptions = {}) {
    try {
      await this.fs.rm(path, options)
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err
    }
  }

  /**
   * Read a directory without throwing an error is the directory doesn't exist
   */
  async readdir(path: string) {
    try {
      const names = await this.fs.readdir(path)
      // Ordering is not guaranteed, and system specific (Windows vs Unix)
      // so we must sort them ourselves.
      names.sort(compareStrings)
      return names
    } catch (err: any) {
      if (err.code === 'ENOTDIR') return null
      return []
    }
  }

  /**
   * Return a flast list of all the files nested inside a directory
   *
   * Based on an elegant concurrent recursive solution from SO
   * https://stackoverflow.com/a/45130990/2168416
   */
  async readdirDeep(path: string): Promise<string[]> {
    const subdirs = await this.fs.readdir(path)
    const files = await Promise.all(subdirs.map(async subdir => {
        const res = path + '/' + subdir
        return (await this.fs.stat(res)).isDirectory() ? this.readdirDeep(res) : res
      })
    )

    return Array.prototype.concat(...files)
  }

  /**
   * Return the Stats of a file/symlink if it exists, otherwise returns null.
   * Rethrows errors that aren't related to file existance.
   */
  async lstat(path: string) {
    try {
      const stats = await this.fs.lstat(path)
      return stats
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return null
      }
      throw err
    }
  }

  /**
   * Reads the contents of a symlink if it exists, otherwise returns null.
   * Rethrows errors that aren't related to file existance.
   */
  async readlink(path: string): Promise<Buffer | null> {
    try {
      return Buffer.from(await this.fs.readlink(path))
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return null
      }
      throw err
    }
  }

  /**
   * Write the contents of buffer to a symlink.
   */
  async writelink(path: string, buffer: Buffer) {
    return this.fs.symlink(buffer.toString('utf8'), path)
  }
}
