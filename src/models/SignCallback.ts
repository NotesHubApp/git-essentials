export type SignCallbackParams = {
  /** A plaintext message. */
  payload: string

  /** 'ASCII armor' encoded PGP key (technically can actually contain _multiple_ keys). */
  secretKey: string
}

/**
 * In order to use the PGP signing feature of {@link commit}, you have to provide a PGP signing callback like so:
 *
 * ```typescript
 * import { pgp } from '@isomorphic-git/pgp-plugin'
 * commit({ ..., onSign: pgp.sign })
 * ```
 *
 * @returns An 'ASCII armor' encoded "detached" signature.
 * @group Callbacks
 */
export type SignCallback =
  (args: SignCallbackParams) => { signature: string } | Promise<{ signature: string }>
