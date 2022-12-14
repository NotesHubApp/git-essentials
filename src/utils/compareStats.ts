import { Stats } from '../models/FsClient'
import { normalizeStats } from './normalizeStats'

/** @internal */
export function compareStats(entry: Stats, stats: Stats) {
  // Comparison based on the description in Paragraph 4 of
  // https://www.kernel.org/pub/software/scm/git/docs/technical/racy-git.txt
  const e = normalizeStats(entry)
  const s = normalizeStats(stats)
  const staleness =
    e.mode !== s.mode ||
    e.mtimeSeconds !== s.mtimeSeconds ||
    e.ctimeSeconds !== s.ctimeSeconds ||
    e.uid !== s.uid ||
    e.gid !== s.gid ||
    e.ino !== s.ino ||
    e.size !== s.size
  return staleness
}
