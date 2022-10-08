import { WalkerEntry } from './Walker'


export type BlobMergeCallbackParams = {
  filePath: string,
  theirBlob: WalkerEntry | null,
  baseBlob: WalkerEntry | null,
  ourBlob: WalkerEntry | null,
  theirName: string,
  baseName: string,
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
