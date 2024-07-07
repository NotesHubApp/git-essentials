// Borrowed from:
// https://github.com/nodejs/node/blob/main/lib/path.js

const CHAR_FORWARD_SLASH = 47; // /
const CHAR_DOT = 46; // .

function isPosixPathSeparator(code: number) {
  return code === CHAR_FORWARD_SLASH;
}

// Resolves . and .. elements in a path with directory names
function normalizeString(
  path: string,
  allowAboveRoot: boolean,
  separator: string,
  isPathSeparator: (code: number) => boolean
) {
  let res = '';
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;
  for (let i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (isPathSeparator(code))
      break;
    else
      code = CHAR_FORWARD_SLASH;

    if (isPathSeparator(code)) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 ||
            res.charCodeAt(res.length - 1) !== CHAR_DOT ||
            res.charCodeAt(res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = '';
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength =
                res.length - 1 - res.lastIndexOf(separator);
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length !== 0) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? `${separator}..` : '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += `${separator}${path.slice(lastSlash + 1, i)}`;
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

/** @internal */
export const posix = {
  normalize(path: string) {
    if (path.length === 0)
      return '.';

    const isAbsolute =
      path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    const trailingSeparator =
      path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;

    // Normalize the path
    path = normalizeString(path, !isAbsolute, '/', isPosixPathSeparator);

    if (path.length === 0) {
      if (isAbsolute)
        return '/';
      return trailingSeparator ? './' : '.';
    }
    if (trailingSeparator)
      path += '/';

    return isAbsolute ? `/${path}` : path;
  },

  join(...args: string[]) {
    if (args.length === 0)
      return '.';
    let joined;
    for (let i = 0; i < args.length; ++i) {
      const arg = args[i];

      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += `/${arg}`;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  }
}
