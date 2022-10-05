// For some reason path.posix.join is undefined in webpack
// Also, this is just much smaller
import { normalizePath } from './normalizePath'

/** @internal */
export function join(...parts: string[]) {
  return normalizePath(parts.map(normalizePath).join('/'))
}
