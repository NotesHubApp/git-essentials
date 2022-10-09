export type ProgressEvent = {
  phase: string
  loaded: number
  total?: number
}

/**
 * Long-running commands can accept the callback that is called with {@link ProgressEvent}`s.
 *
 * Progress events are not guaranteed to be in order or always incrementing.
 * Many git commands (like `clone`) actually consist of multiple sub-commands (`fetch` + `indexPack` + `checkout`)
 * which makes computing a single progress percentage tricky.
 * Instead, progress events are marked with a `phase` that provides a description of what step of the process it is in.
 * You could choose to show the phase as a label next to the progress bar, or show one progress bar per phase.
 *
 * @example
 * You are writing a browser application, and want to display progress in your UI somehow.
 *
 * ```typescript
 * import { clone } from 'git-essentials'
 * clone({
 *   ...,
 *   onProgress: event => {
 *     updateLabel(event.phase)
 *     if (event.total) {
 *       updateProgressBar(event.loaded / event.total)
 *     } else {
 *       updateIndeterminateProgressBar(event.loaded)
 *     }
 *   }
 * })
 * ```
 *
 * @group Callbacks
 */
export type ProgressCallback = (args: ProgressEvent) => Promise<void>
