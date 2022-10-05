import { NormalizedAuthor } from '../models/NormalizedAuthor'

/** @internal */
export function parseAuthor(author: string): NormalizedAuthor {
  const [, name, email, timestamp, offset] = author.match(/^(.*) <(.*)> (.*) (.*)$/) as string[]
  return {
    name: name,
    email: email,
    timestamp: Number(timestamp),
    timezoneOffset: parseTimezoneOffset(offset),
  }
}

// The amount of effort that went into crafting these cases to handle
// -0 (just so we don't lose that information when parsing and reconstructing)
// but can also default to +0 was extraordinary.

function parseTimezoneOffset(offset: string) {
  const [, sign, hours, minutes] = offset.match(/(\+|-)(\d\d)(\d\d)/) as string[]
  const minutesNum = (sign === '+' ? 1 : -1) * (Number(hours) * 60 + Number(minutes))
  return negateExceptForZero(minutesNum)
}

function negateExceptForZero(n: number) {
  return n === 0 ? n : -n
}
