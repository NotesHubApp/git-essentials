import { normalizeMode } from './normalizeMode'

const MAX_UINT32 = 2 ** 32

type Stat = {
  mode: number;
  size: number;
  ino: number | BigInt;
  mtimeMs: number;
  ctimeMs?: number;

  // Non-standard
  uid: number;
  gid: number;
  dev: number;

  ctime?: Date;
  ctimeSeconds?: number;
  ctimeNanoseconds?: number;

  mtime?: Date;
  mtimeSeconds?: number;
  mtimeNanoseconds?: number;
}

function SecondsNanoseconds(
  givenSeconds?: number,
  givenNanoseconds?: number,
  milliseconds?: number,
  date?: Date
) {
  if (givenSeconds !== undefined && givenNanoseconds !== undefined) {
    return [givenSeconds, givenNanoseconds]
  }

  if (milliseconds === undefined && date !== undefined) {
    milliseconds = date.valueOf()
  }

  const seconds = milliseconds !== undefined ? Math.floor(milliseconds / 1000) : 0
  const nanoseconds = milliseconds !== undefined ? (milliseconds - seconds * 1000) * 1000000 : 0
  return [seconds, nanoseconds]
}

export function normalizeStats(e: Stat) {
  const [ctimeSeconds, ctimeNanoseconds] = SecondsNanoseconds(
    e.ctimeSeconds,
    e.ctimeNanoseconds,
    e.ctimeMs,
    e.ctime
  )
  const [mtimeSeconds, mtimeNanoseconds] = SecondsNanoseconds(
    e.mtimeSeconds,
    e.mtimeNanoseconds,
    e.mtimeMs,
    e.mtime
  )

  return {
    ctimeSeconds: ctimeSeconds % MAX_UINT32,
    ctimeNanoseconds: ctimeNanoseconds % MAX_UINT32,
    mtimeSeconds: mtimeSeconds % MAX_UINT32,
    mtimeNanoseconds: mtimeNanoseconds % MAX_UINT32,
    dev: e.dev % MAX_UINT32,
    ino: Number(e.ino) % MAX_UINT32,
    mode: normalizeMode(e.mode % MAX_UINT32),
    uid: e.uid % MAX_UINT32,
    gid: e.gid % MAX_UINT32,
    // size of -1 happens over a BrowserFS HTTP Backend that doesn't serve Content-Length headers
    // (like the Karma webserver) because BrowserFS HTTP Backend uses HTTP HEAD requests to do fs.stat
    size: e.size > -1 ? e.size % MAX_UINT32 : 0,
  }
}
