import { Buffer } from 'buffer'

import { GitHttpRequest, GitHttpResponse, HttpClient, HttpHeaders } from '../../src'

export type HttpFixtureData = HttpFixtureEntry[]

type HttpFixtureEntry = {
  request: HttpFixtureRequest
  response: HttpFixtureResponse
}

type HttpStatusCode = 200

const DefaultStatusCode = 200

type HttpFixtureRequest = {
  url: string
  method: 'GET' | 'POST'
  encoding?: 'utf8' | 'base64'
  body?: string
}

type HttpFixtureResponse = {
  statusCode?: HttpStatusCode
  headers: HttpHeaders
  body?: string
}

function statusCodeToStatusMessage(code: HttpStatusCode): string {
  switch (code) {
    case 200: return 'OK'
  }
}

function findMatch(fixture: HttpFixtureData, request: GitHttpRequest): HttpFixtureEntry | undefined {
  const requestUrl = new URL(request.url)
  const requestUrlMatchPart = requestUrl.pathname + requestUrl.search

  return fixture.find(x =>
    x.request.url === requestUrlMatchPart &&
    x.request.method === request.method)
}

function toHttpResponse(sourceRequest: GitHttpRequest, fixtureResponse: HttpFixtureResponse): GitHttpResponse {
  const headers: HttpHeaders = {}
  for (const headerName in fixtureResponse.headers) {
    headers[headerName] = fixtureResponse.headers[headerName]
  }

  const body = fixtureResponse.body ? [Buffer.from(fixtureResponse.body, 'base64')] : undefined

  return {
    url: sourceRequest.url,
    method: sourceRequest.method,
    statusCode: fixtureResponse.statusCode ?? DefaultStatusCode,
    statusMessage: statusCodeToStatusMessage(fixtureResponse.statusCode ?? DefaultStatusCode),
    headers,
    body
  }
}

export function makeHttpFixture(data: HttpFixtureData): HttpClient {
  /**
   * HttpClient
   *
   * @param {GitHttpRequest} httpRequest
   * @returns {Promise<GitHttpResponse>}
   */
  async function request(httpRequest: GitHttpRequest): Promise<GitHttpResponse> {
    const matchingEntry = findMatch(data, httpRequest)

    if (!matchingEntry) {
      throw new Error('No matching request found.')
    }

    const httpResponse = toHttpResponse(httpRequest, matchingEntry.response)
    return httpResponse
  }

  return { request }
}
