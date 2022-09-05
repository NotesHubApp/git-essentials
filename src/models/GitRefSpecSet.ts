import { GitRefSpec } from './GitRefSpec'

export class GitRefSpecSet {
  private rules: GitRefSpec[]

  constructor(rules: GitRefSpec[] = []) {
    this.rules = rules
  }

  static from(refspecs: string[]) {
    const rules: GitRefSpec[] = []
    for (const refspec of refspecs) {
      rules.push(GitRefSpec.from(refspec)) // might throw
    }
    return new GitRefSpecSet(rules)
  }

  add(refspec: string) {
    const rule = GitRefSpec.from(refspec) // might throw
    this.rules.push(rule)
  }

  translate(remoteRefs: string[]) {
    const result: string[][] = []
    for (const rule of this.rules) {
      for (const remoteRef of remoteRefs) {
        const localRef = rule.translate(remoteRef)
        if (localRef) {
          result.push([remoteRef, localRef])
        }
      }
    }
    return result
  }

  translateOne(remoteRef: string) {
    let result: string | null = null
    for (const rule of this.rules) {
      const localRef = rule.translate(remoteRef)
      if (localRef) {
        result = localRef
      }
    }
    return result
  }

  localNamespaces() {
    return this.rules
      .filter(rule => rule.matchPrefix)
      .map(rule => rule.localPath.replace(/\/$/, ''))
  }
}
