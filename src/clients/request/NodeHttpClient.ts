import http from 'http'
import https, { RequestOptions } from 'https'
import { HttpRequest, HttpResponse, HttpHeaders } from 'git-essentials'


function request(req: HttpRequest): Promise<HttpResponse> {
  return new Promise<HttpResponse>((resolve, reject) => {
    const parsedRequestUrl = new URL(req.url)
    const requestOptions: RequestOptions = {
      host: parsedRequestUrl.host,
      path: parsedRequestUrl.pathname + parsedRequestUrl.search,
      method: req.method,
      headers: req.headers
    }

    const r = (parsedRequestUrl.protocol === 'https:' ? https : http).request
    const clientRequest = r(requestOptions, async (res) => {
      let chunks: Buffer[] = []

      res.on('data', (chunk) => {
        chunks.push(chunk)
      }).on('end', () => {
        const resHeaders: HttpHeaders = {}
        for (const headerName in res.headers) {
          const headerValue = res.headers[headerName]
          if (typeof headerValue === 'string') {
            resHeaders[headerName] = headerValue
          } else {
            resHeaders[headerName] = (headerValue || []).join(';')
          }
        }

        resolve({
          url: res.url!,
          statusCode: res.statusCode!,
          statusMessage: res.statusMessage!,
          headers: resHeaders,
          body: chunks
        })
      }).on('error', (e) => {
        reject(e)
      })
    })

    if (req.body) {
      clientRequest.write(Buffer.concat(req.body as Uint8Array[]))
    }

    clientRequest.end()
  })
}

export type NodeHttpClientOptions = {}

export function makeNodeHttpClient(options: NodeHttpClientOptions = {}) {
  return { request }
}
