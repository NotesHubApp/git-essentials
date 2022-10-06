type SignCallbackParams = {
  /** A plaintext message. */
  payload: string

  /** 'ASCII armor' encoded PGP key (technically can actually contain _multiple_ keys). */
  secretKey: string
}

/**
 * @group Callbacks
 */
export type SignCallback =
  (args: SignCallbackParams) => { signature: string } | Promise<{ signature: string }>
