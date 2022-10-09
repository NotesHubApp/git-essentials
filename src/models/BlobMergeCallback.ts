import { WalkerEntry } from './Walker'


export type BlobMergeCallbackParams = {
  /** Rrefers to the path of the conflicted file, relative to the root of the git repository. */
  filePath: string,

  /** Their blob entry. */
  theirBlob: WalkerEntry | null,

  /** Base blob entry. */
  baseBlob: WalkerEntry | null,

  /** Our blob entry. */
  ourBlob: WalkerEntry | null,

  /** The name to use in conflicted files for their hunks. */
  theirName: string,

  /** The name to use in conflicted files (in diff3 format) for the base hunks. */
  baseName: string,

  /** The name to use in conflicted files for our hunks. */
  ourName: string
}

export type BlobMergeCallbackResult =
  | { mergedText: string, mode: number }
  | { oid: string, mode: number }
  | undefined

/**
 * Provides a custom merge strategy when the default one is not sufficient.
 * @throws {@link Errors.MergeNotSupportedError} when merge is not clean.
 * @group Callbacks
 */
export type BlobMergeCallback = (args: BlobMergeCallbackParams) => Promise<BlobMergeCallbackResult>
