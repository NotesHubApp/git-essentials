export function stripCredentialsFromUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    url.username = '';
    url.password = '';

    return url.toString();
  } catch {
    return urlString;
  }
}
