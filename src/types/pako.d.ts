declare namespace pako {
  interface ZStream {
    avail_in: number
    avail_out: number
  }

  interface Inflate {
    strm: ZStream
  }
}
