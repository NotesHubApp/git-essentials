import { Buffer } from 'buffer'

import { InternalError } from '../errors/InternalError'
import { formatAuthor } from '../utils/formatAuthor'
import { normalizeNewlines } from '../utils/normalizeNewlines'
import { parseAuthor } from '../utils/parseAuthor'
import { SignCallback } from './_common'
import { NormalizedAuthor } from './NormalizedAuthor'

type TagHeaders = {
  tagger: NormalizedAuthor
  committer: NormalizedAuthor
  object: string
  type: string
  tag: string
  gpgsig: string
}

type Tag = TagHeaders & {
  message: string
}

/** @internal */
export class GitAnnotatedTag {
  private _tag: string

  constructor(tag: string | Buffer | Tag) {
    if (typeof tag === 'string') {
      this._tag = tag
    } else if (Buffer.isBuffer(tag)) {
      this._tag = tag.toString('utf8')
    } else if (typeof tag === 'object') {
      this._tag = GitAnnotatedTag.render(tag)
    } else {
      throw new InternalError(
        'invalid type passed to GitAnnotatedTag constructor'
      )
    }
  }

  static from(tag: string | Buffer | Tag) {
    return new GitAnnotatedTag(tag)
  }

  static render(obj: Tag) {
    return `object ${obj.object}
type ${obj.type}
tag ${obj.tag}
tagger ${formatAuthor(obj.tagger)}

${obj.message}
${obj.gpgsig ? obj.gpgsig : ''}`
  }

  justHeaders() {
    return this._tag.slice(0, this._tag.indexOf('\n\n'))
  }

  message() {
    const tag = this.withoutSignature()
    return tag.slice(tag.indexOf('\n\n') + 2)
  }

  parse(): Tag {
    return Object.assign(this.headers(), {
      message: this.message(),
      gpgsig: this.gpgsig(),
    })
  }

  render() {
    return this._tag
  }

  headers(): TagHeaders {
    const headers = this.justHeaders().split('\n')
    const hs: string[] = []
    for (const h of headers) {
      if (h[0] === ' ') {
        // combine with previous header (without space indent)
        hs[hs.length - 1] += '\n' + h.slice(1)
      } else {
        hs.push(h)
      }
    }
    const obj: any = {}
    for (const h of hs) {
      const key = h.slice(0, h.indexOf(' '))
      const value = h.slice(h.indexOf(' ') + 1)
      if (Array.isArray(obj[key])) {
        obj[key].push(value)
      } else {
        obj[key] = value
      }
    }

    if (obj.tagger) {
      obj.tagger = parseAuthor(obj.tagger)
    }

    if (obj.committer) {
      obj.committer = parseAuthor(obj.committer)
    }

    return obj
  }

  withoutSignature() {
    const tag = normalizeNewlines(this._tag)
    if (tag.indexOf('\n-----BEGIN PGP SIGNATURE-----') === -1) return tag
    return tag.slice(0, tag.lastIndexOf('\n-----BEGIN PGP SIGNATURE-----'))
  }

  gpgsig() {
    if (this._tag.indexOf('\n-----BEGIN PGP SIGNATURE-----') === -1) return
    const signature = this._tag.slice(
      this._tag.indexOf('-----BEGIN PGP SIGNATURE-----'),
      this._tag.indexOf('-----END PGP SIGNATURE-----') +
        '-----END PGP SIGNATURE-----'.length
    )
    return normalizeNewlines(signature)
  }

  payload() {
    return this.withoutSignature() + '\n'
  }

  toObject() {
    return Buffer.from(this._tag, 'utf8')
  }

  static async sign(tag: GitAnnotatedTag, sign: SignCallback, secretKey: string) {
    const payload = tag.payload()
    let { signature } = await sign({ payload, secretKey })
    // renormalize the line endings to the one true line-ending
    signature = normalizeNewlines(signature)
    const signedTag = payload + signature
    // return a new tag object
    return GitAnnotatedTag.from(signedTag)
  }
}
