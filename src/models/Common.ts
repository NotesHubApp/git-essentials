export type SignParams = {
  payload: string  // plaintext message
  secretKey: string // 'ASCII armor' encoded PGP key (technically can actually contain _multiple_ keys)
}

export type SignCallback =
  (args: SignParams) => { signature: string } | Promise<{ signature: string }> // an 'ASCII armor' encoded "detached"


export type ProgressParams = {
  phase: string
  loaded: number
  total?: number
}

export type ProgressCallback = (args: ProgressParams) => Promise<void>
