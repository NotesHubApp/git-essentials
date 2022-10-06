export type ProgressEvent = {
  phase: string
  loaded: number
  total?: number
}

/**
 * @group Callbacks
 */
export type ProgressCallback = (args: ProgressEvent) => Promise<void>
