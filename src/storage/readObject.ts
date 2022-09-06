import { Buffer } from 'buffer'

import { FileSystem } from '../models/FileSystem'
import { Cache } from '../models/Cache'
import { InternalError } from '../errors/InternalError'
import { NotFoundError } from '../errors/NotFoundError'
import { GitObject } from '../models/GitObject'
import { readObjectLoose } from '../storage/readObjectLoose'
import { readObjectPacked } from '../storage/readObjectPacked'
import { inflate } from '../utils/inflate'
import { shasum } from '../utils/shasum'

type ReadObjectParams = {
  fs: FileSystem
  cache: Cache
  gitdir: string
  oid: string
}

type ReadObjectResult = {
  type: string,
  object: Buffer,
  format: string,
  source?: string
}

/**
 * @param {object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {any} args.cache
 * @param {string} args.gitdir
 * @param {string} args.oid
 * @param {string} [args.format]
 */
export async function _readObject({ fs, cache, gitdir, oid }: ReadObjectParams): Promise<ReadObjectResult> {
  // Curry the current read method so that the packfile un-deltification
  // process can acquire external ref-deltas.
  const getExternalRefDelta = (oid: string) => _readObject({ fs, cache, gitdir, oid })

  let result: { format: string, object: Buffer, type?: string, source?: string } | null = null
  // Empty tree - hard-coded so we can use it as a shorthand.
  // Note: I think the canonical git implementation must do this too because
  // `git cat-file -t 4b825dc642cb6eb9a060e54bf8d69288fbee4904` prints "tree" even in empty repos.
  if (oid === '4b825dc642cb6eb9a060e54bf8d69288fbee4904') {
    result = { format: 'wrapped', object: Buffer.from(`tree 0\x00`) }
  }
  // Look for it in the loose object directory.
  if (!result) {
    result = await readObjectLoose({ fs, gitdir, oid })
  }
  // Check to see if it's in a packfile.
  if (!result) {
    result = await readObjectPacked({
      fs,
      cache,
      gitdir,
      oid,
      getExternalRefDelta,
    })
  }

  // Finally
  if (!result) {
    throw new NotFoundError(oid)
  }

  // BEHOLD! THE ONLY TIME I'VE EVER WANTED TO USE A CASE STATEMENT WITH FOLLOWTHROUGH!
  // eslint-ignore
  /* eslint-disable no-fallthrough */
  switch (result.format) {
    case 'deflated': {
      result.object = Buffer.from(await inflate(result.object))
      result.format = 'wrapped'
    }
    case 'wrapped': {
      const sha = await shasum(result.object)
      if (sha !== oid) {
        throw new InternalError(
          `SHA check failed! Expected ${oid}, computed ${sha}`
        )
      }
      const { object, type } = GitObject.unwrap(result.object)
      result.type = type
      result.object = object
      result.format = 'content'
    }
    case 'content': {
      return {
        type: result.type!,
        object: result.object,
        format: result.format,
        source: result.source
      }
    }
    default: {
      throw new InternalError(`invalid format "${result.format}"`)
    }
  }
  /* eslint-enable no-fallthrough */
}
