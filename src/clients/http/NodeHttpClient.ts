import https, { RequestOptions } from 'https'
import { GitHttpRequest, GitHttpResponse, HttpHeaders } from '../../models'


function request(req: GitHttpRequest): Promise<GitHttpResponse> {
  return new Promise<GitHttpResponse>((resolve, reject) => {
    const parsedRequestUrl = new URL(req.url)
    const requestOptions: RequestOptions = {
      host: parsedRequestUrl.host,
      path: parsedRequestUrl.pathname + parsedRequestUrl.search,
      method: req.method,
      headers: req.headers
    }

    const nodeRequest = https.request(requestOptions, async (res) => {
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
      nodeRequest.write(Buffer.concat(req.body as Uint8Array[]))
    }

    nodeRequest.end()
  })
}

export type NodeHttpClientOptions = {}

export function makeNodeHttpClient(options: NodeHttpClientOptions = {}) {
  return { request }
}
