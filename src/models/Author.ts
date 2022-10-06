/**
 * The details about the author.
 */
 export type Author = {
  /** Default is `user.name` config. */
  name: string

  /** Default is `user.email` config. */
  email?: string

  /** Set the author timestamp field. This is the integer number of seconds since the Unix epoch (1970-01-01 00:00:00). */
  timestamp?: number

  /** Set the author timezone offset field. This is the difference, in minutes, from the current timezone to UTC. Default is `(new Date()).getTimezoneOffset()`. */
  timezoneOffset?: number
}
