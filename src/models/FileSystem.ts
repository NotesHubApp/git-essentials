import { Buffer } from 'buffer'

import { compareStrings } from '../utils/compareStrings'
import { dirname } from '../utils/dirname'
import { EncodingOpts, IBackend, ReadLinkOptions } from './IBackend'

/**
 * This is just a collection of helper functions really. At least that's how it started.
 */
export class FileSystem {
  constructor(private readonly fs: IBackend) { }

  /**
   * Return true if a file exists, false if it doesn't exist.
   * Rethrows errors that aren't related to file existance.
   */
  async exists(filepath: string): Promise<boolean> {
    try {
      await this.fs.stat(filepath)
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
   *
   * @param {string} filepath
   * @param {object} [options]
   *
   * @returns {Promise<Buffer | string | null>}
   */
  async read(filepath: string, options: EncodingOpts = {}): Promise<Buffer | string | null> {
    try {
      let buffer = await this.fs.readFile(filepath, options)
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
   *
   * @param {string} filepath
   * @param {Buffer|Uint8Array|string} contents
   * @param {object|string} [options]
   */
  async write(filepath: string, contents: string | Uint8Array, options: EncodingOpts = {}) {
    try {
      await this.fs.writeFile(filepath, contents, options)
      return
    } catch (err) {
      // Hmm. Let's try mkdirp and try again.
      await this.mkdir(dirname(filepath))
      await this.fs.writeFile(filepath, contents, options)
    }
  }

  /**
   * Make a directory (or series of nested directories) without throwing an error if it already exists.
   */
  async mkdir(filepath: string, _selfCall = false) {
    try {
      await this.fs.mkdir(filepath)
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
        const parent = dirname(filepath)
        // Check to see if we've gone too far
        if (parent === '.' || parent === '/' || parent === filepath) throw err
        // Infinite recursion, what could go wrong?
        await this.mkdir(parent)
        await this.mkdir(filepath, true)
      }
    }
  }

  /**
   * Delete a file without throwing an error if it is already deleted.
   */
  async rm(filepath: string) {
    try {
      await this.fs.unlink(filepath)
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err
    }
  }

  /**
   * Delete a directory without throwing an error if it is already deleted.
   */
  async rmdir(filepath: string) {
    try {
      await this.fs.rmdir(filepath)
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err
    }
  }

  /**
   * Read a directory without throwing an error is the directory doesn't exist
   */
  async readdir(filepath: string) {
    try {
      const names = await this.fs.readdir(filepath)
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
  async readdirDeep(dir: string): Promise<string[]> {
    const subdirs = await this.fs.readdir(dir)
    const files = await Promise.all(subdirs.map(async subdir => {
        const res = dir + '/' + subdir
        return (await this.fs.stat(res)).isDirectory() ? this.readdirDeep(res) : res
      })
    )

    return Array.prototype.concat(...files)
  }

  /**
   * Return the Stats of a file/symlink if it exists, otherwise returns null.
   * Rethrows errors that aren't related to file existance.
   */
  async lstat(filename: string) {
    try {
      const stats = await this.fs.lstat(filename)
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
  async readlink(filename: string, opts: ReadLinkOptions = { encoding: 'buffer' }) {
    // Note: FileSystem.readlink returns a buffer by default
    // so we can dump it into GitObject.write just like any other file.
    try {
      return this.fs.readlink(filename, opts)
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
  async writelink(filename: string, buffer: Buffer) {
    return this.fs.symlink(buffer.toString('utf8'), filename)
  }
}
