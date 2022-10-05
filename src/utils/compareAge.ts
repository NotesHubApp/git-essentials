type Commit = {
  committer: { timestamp: number }
}

/** @internal */
export function compareAge(a: Commit, b: Commit) {
  return a.committer.timestamp - b.committer.timestamp
}
