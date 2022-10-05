import { WalkerEntry } from './WalkerEntry'


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
 * @group Callbacks
 */
export type BlobMergeCallback = (args: BlobMergeCallbackParams) => Promise<BlobMergeCallbackResult>
