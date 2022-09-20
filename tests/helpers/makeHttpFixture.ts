import { Buffer } from 'buffer'

import { GitHttpRequest, GitHttpResponse, HttpClient, HttpHeaders } from '../../src'
import { collect } from '../../src/utils/collect'
import { NoMatchingRequestFoundError } from './NoMatchingRequestFoundError'

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
  contentType?: string
  encoding?: 'utf8' | 'base64'
  body?: string
}

type HttpFixtureResponse = {
  statusCode?: HttpStatusCode
  contentType: string
  body?: string
}

function statusCodeToStatusMessage(code: HttpStatusCode): string {
  switch (code) {
    case 200: return 'OK'
  }
}

function findMatch(fixture: HttpFixtureData, request: GitHttpRequest): HttpFixtureEntry | undefined {
  return fixture.find(x =>
    x.request.url === request.url &&
    x.request.method === request.method &&
    (request.headers && x.request.contentType === request.headers['content-type']))
}

function toHttpResponse(sourceRequest: GitHttpRequest, fixtureResponse: HttpFixtureResponse): GitHttpResponse {
  const headers: HttpHeaders = {
    'content-type': fixtureResponse.contentType
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

export function makeHttpFixture(fixtureData: HttpFixtureData): HttpClient {
  /**
   * HttpClient
   *
   * @param {GitHttpRequest} httpRequest
   * @returns {Promise<GitHttpResponse>}
   */
  async function request(httpRequest: GitHttpRequest): Promise<GitHttpResponse> {
    const matchingEntry = findMatch(fixtureData, httpRequest)

    if (!matchingEntry) {
      const payload = httpRequest.body ?
        Buffer.from(await collect(httpRequest.body)).toString('base64') :
        undefined
      throw new NoMatchingRequestFoundError(httpRequest, payload)
    }

    const httpResponse = toHttpResponse(httpRequest, matchingEntry.response)
    return httpResponse
  }

  return { request }
}
