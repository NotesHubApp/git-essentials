export type CacheEntryFlags = {
  assumeValid: boolean
  extended: boolean
  stage: number
  nameLength: number
}

export type CacheEntry = {
  ctimeSeconds: number
  ctimeNanoseconds: number
  mtimeSeconds: number
  mtimeNanoseconds: number
  dev: number
  ino: number
  mode: number
  uid: number
  gid: number
  size: number
  oid: string

  path: string
  flags: CacheEntryFlags
}
