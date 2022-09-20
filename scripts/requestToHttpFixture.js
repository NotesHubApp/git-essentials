const https = require('https')

const scriptArgs = process.argv.slice(2)
const [url, body] = scriptArgs

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
    const body = Buffer.concat(chunks).toString('base64')
    const fixture = generateFixture(body, res.headers['content-type'])
    const jsonFixture = JSON.stringify(fixture, null, 2)

    console.log('Fixture:\n')
    console.log(ConsoleColors.Blue, jsonFixture)
  }).on('error', (e) => {
    console.error(`Error: ${e.message}`);
  })
})

if (body) {
  req.write(Buffer.from(body, 'base64'))
}

req.end()

const ConsoleColors = {
  Blue: '\x1b[34m%s\x1b[0m'
}

function generateFixture(responseBody, responseContentType) {
  const requestContentType = !infoRequest ? { contentType: `application/x-${service}-request` } : {}
  const requestBody = body ? { body: body } : {}

  return {
    request: {
      url: url,
      method: method,
      ...requestContentType,
      ...requestBody
    },
    response: {
      contentType: responseContentType,
      body: responseBody
    }
  }
}
