type Commit = {
  committer: { timestamp: number }
}

export function compareAge(a: Commit, b: Commit) {
  return a.committer.timestamp - b.committer.timestamp
}
