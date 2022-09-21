const https = require('https')

const scriptArgs = process.argv.slice(2)
const [url, payload] = scriptArgs

const parsedUrl = new URL(url)
const infoRequest = parsedUrl.pathname.endsWith('/info/refs')
const method = infoRequest ? 'GET' : 'POST'
const service = infoRequest ?
  parsedUrl.searchParams.get('service') :
  parsedUrl.pathname.substring(parsedUrl.pathname.lastIndexOf('/') + 1)
const contentType = !infoRequest ? { 'content-type': `application/x-${service}-request` } : {}

/** @type {https.RequestOptions} */
const requestOptions = {
  host: parsedUrl.host,
  path: parsedUrl.pathname + parsedUrl.search,
  method: method,
  headers: {
    ...contentType,
    'user-agent': 'git/noteshub'
  }
}

const req = https.request(requestOptions, async (res) => {
  console.log(`Status code: ${res.statusCode}`)
  if (res.statusCode !== 200) {
    throw new Error('Response has an error!')
  }

  let chunks = []
  res.on('data', (chunk) => {
    chunks.push(chunk)
  }).on('end', () => {
    const body = Buffer.concat(chunks)
    const fixture = generateFixture(body, res.headers['content-type'])
    const jsonFixture = JSON.stringify(fixture, null, 2)

    console.log('Copy generated fixture below into your HttpFixure file:\n')
    console.log(jsonFixture)
  }).on('error', (e) => {
    console.error(`Error: ${e.message}`);
  })
})

if (payload) {
  req.write(Buffer.from(payload, 'base64'))
}

req.end()


/**
 *
 * @param {Buffer} responseBody
 * @param {string} responseContentType
 */
function generateFixture(responseBody, responseContentType) {
  const requestContentType = !infoRequest ? { contentType: `application/x-${service}-request` } : {}
  let requestBody = {}
  if (payload) {
    const requestEncoding = service !== 'git-receive-pack' ? 'utf8' : 'base64'
    requestBody = { encoding: requestEncoding, body: Buffer.from(payload, 'base64').toString(requestEncoding) }
  }
  const responseEncoding = infoRequest ? 'utf8' : 'base64'

  return {
    request: {
      url: url,
      method: method,
      ...requestContentType,
      ...requestBody
    },
    response: {
      contentType: responseContentType,
      encoding: responseEncoding,
      body: responseBody.toString(responseEncoding)
    }
  }
}
