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
 *
 * @example
 * Prefer their changes without reading the content of the blob and just returning their object id.
 * ```typescript
 * const obBlobMerge: BlobMergeCallback = async ({ theirBlob, ourBlob }) => {
 *   if (ourBlob && theirBlob) {
 *     return { oid: await theirBlob.oid(), mode: await theirBlob.mode() }
 *   }
 *
 *   throw new MergeNotSupportedError()
 * }
 * ```
 * @example
 * Prefer their changes with returning their text.
 * ```typescript
 * const obBlobMerge: BlobMergeCallback = async ({ theirBlob, ourBlob }) => {
 *   if (ourBlob && theirBlob) {
 *     const ourContent = await ourBlob.content()
 *     const theirContent = await theirBlob.content()
 *
 *     const decoder = new TextDecoder()
 *     const ourText = decoder.decode(ourContent)
 *     const theirText = decoder.decode(theirContent)
 *
 *     return { mergedText: theirText, mode: await theirBlob.mode() }
 *   }
 *
 *   throw new MergeNotSupportedError()
 * }
 * ```
 * Please note that those examples are very basic implementations.
 * The actual one could be much more complicated and could include following the logic:
 * * Detect if the blob has binary or text content:
 *    * If binary: decide which one to return or throw {@link Errors.MergeNotSupportedError}.
 *    * If text: apply [diff3](https://www.npmjs.com/package/diff3) merge algorithm to return merged text.
 * * Decide what to do if there is no base blob.
 * * Decide what to do if one of the blobs were deleted.
 *
 * @throws {@link Errors.MergeNotSupportedError} when merge is not clean.
 * @group Callbacks
 */
export type BlobMergeCallback = (args: BlobMergeCallbackParams) => Promise<BlobMergeCallbackResult>
