import { Auth } from '../models'

/** @internal */
export function extractAuthFromUrl(url: string): { url: string, auth: Auth } {
  // For whatever reason, the `fetch` API does not convert credentials embedded in the URL
  // into Basic Authentication headers automatically. Instead it throws an error!
  // So we must manually parse the URL, rip out the user:password portion if it is present
  // and compute the Authorization header.
  // Note: I tried using new URL(url) but that throws a security exception in Edge. :rolleyes:
  const userpassMatch = url.match(/^https?:\/\/([^/]+)@/)
  // No credentials, return the url unmodified and an empty auth object
  if (userpassMatch == null) return { url, auth: {} }
  const userpass = userpassMatch[1]
  const [username, password] = userpass.split(':')
  // Remove credentials from URL
  url = url.replace(`${userpass}@`, '')
  // Has credentials, return the fetch-safe URL and the parsed credentials
  return {
    url: url,
    auth: {
      username: decodeURIComponent(username),
      password: decodeURIComponent(password)
    }
  }
}
