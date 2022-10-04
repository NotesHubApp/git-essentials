import { Buffer } from 'buffer'

import { GitHttpRequest, GitHttpResponse, HttpClient, HttpHeaders } from 'git-essentials'

import { collect } from '../../src/utils/collect'
import { NoMatchingRequestFoundError } from './NoMatchingRequestFoundError'

export type HttpFixtureData = HttpFixtureEntry[]

type HttpFixtureEntry = {
  comment?: string
  request: HttpFixtureRequest
  response: HttpFixtureResponse
}

type HttpStatusCode = 200

const DefaultStatusCode = 200

type HttpFixtureRequest = {
  url: string
  method: 'GET' | 'POST'
  contentType?: string
  authorization?: string
  encoding?: 'utf8' | 'base64'
  body?: string
}

type HttpFixtureResponse = {
  statusCode?: HttpStatusCode
  contentType: string
  encoding?: 'utf8' | 'base64'
  body?: string
}

function statusCodeToStatusMessage(code: HttpStatusCode): string {
  switch (code) {
    case 200: return 'OK'
  }
}

function findMatch(fixture: HttpFixtureData, request: GitHttpRequest, requestPayload?: Buffer):
  HttpFixtureEntry | undefined {
  function matchHeaders(contentType?: string) {
    if (request.headers) {
      const requestContentType = request.headers['content-type']
      return !requestContentType || (contentType === requestContentType)
    }
    return true
  }

  function matchBody(body?: string, encoding?: 'base64' | 'utf8') {
    if (requestPayload) {
      const requestBody = requestPayload.toString(encoding)
      return body === requestBody
    }
    return true
  }

  return fixture.find(x =>
    x.request.url === request.url &&
    x.request.method === request.method &&
    matchHeaders(x.request.contentType) &&
    matchBody(x.request.body, x.request.encoding))
}

function toHttpResponse(sourceRequest: GitHttpRequest, fixtureResponse: HttpFixtureResponse): GitHttpResponse {
  const headers: HttpHeaders = {
    'content-type': fixtureResponse.contentType
  }

  const body = fixtureResponse.body ?
    [Buffer.from(fixtureResponse.body, fixtureResponse.encoding ?? 'base64')] :
    undefined

  return {
    url: sourceRequest.url,
    method: sourceRequest.method,
    statusCode: fixtureResponse.statusCode ?? DefaultStatusCode,
    statusMessage: statusCodeToStatusMessage(fixtureResponse.statusCode ?? DefaultStatusCode),
    headers,
    body
  }
}

function authorizationRequiredResponse(url: string, reason: string): GitHttpResponse {
  return {
    url: url,
    statusCode: 401,
    statusMessage: 'Authorization Required',
    headers: { 'WWW-Authenticate': 'Basic' },
    body: [Buffer.from(reason)]
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
    const payload = httpRequest.body ? Buffer.from(await collect(httpRequest.body)) : undefined
    const matchingEntry = findMatch(fixtureData, httpRequest, payload)

    if (!matchingEntry) {
      throw new NoMatchingRequestFoundError(httpRequest.url, payload)
    }

    if (matchingEntry.request.authorization) {
      if (!httpRequest.headers || !httpRequest.headers.Authorization) {
        return authorizationRequiredResponse(httpRequest.url, 'Unauthorized\n')
      }

      if (matchingEntry.request.authorization !== httpRequest.headers.Authorization) {
        return authorizationRequiredResponse(httpRequest.url, 'Bad credentials\n')
      }
    }

    const httpResponse = toHttpResponse(httpRequest, matchingEntry.response)
    return httpResponse
  }

  return { request }
}
