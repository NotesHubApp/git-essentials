/* eslint-env node, browser */
import { Buffer } from 'buffer'
import { sha1 as Hash } from 'sha.js'

import { toHex } from './toHex'

let supportsSubtleSHA1: boolean | undefined = undefined

/** @internal */
export async function shasum(buffer: Buffer) {
  if (supportsSubtleSHA1 === undefined) {
    supportsSubtleSHA1 = await testSubtleSHA1()
  }
  return supportsSubtleSHA1 ? subtleSHA1(buffer) : shasumSync(buffer)
}

// This is modeled after @dominictarr's "shasum" module,
// but without the 'json-stable-stringify' dependency and
// extra type-casting features.
function shasumSync(buffer: Buffer) {
  return new Hash().update(buffer).digest('hex')
}

async function subtleSHA1(buffer: BufferSource) {
  const hash = await crypto.subtle.digest('SHA-1', buffer)
  return toHex(hash)
}

async function testSubtleSHA1(): Promise<boolean> {
  // I'm using a rather crude method of progressive enhancement, because
  // some browsers that have crypto.subtle.digest don't actually implement SHA-1.
  try {
    const hash = await subtleSHA1(new Uint8Array([]))
    if (hash === 'da39a3ee5e6b4b0d3255bfef95601890afd80709') return true
  } catch (_) {
    // no bother
  }
  return false
}
