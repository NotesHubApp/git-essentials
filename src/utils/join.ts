// For some reason path.posix.join is undefined in webpack
// Also, this is just much smaller
import { normalizePath } from './normalizePath'
import { posix } from './path'

export const join = posix.join

/** @internal */
// export function join(...parts: string[]) {
//   return posix.join(...parts);
//   //return normalizePath(parts.map(normalizePath).join('/'))
// }
