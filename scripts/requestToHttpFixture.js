const https = require('https')

const scriptArgs = process.argv.slice(2)
const [url, body] = scriptArgs

const parsedUrl = new URL(url)
const infoRequest = parsedUrl.pathname.endsWith('/info/refs')
const service = infoRequest ?
  parsedUrl.searchParams.get('service') :
  parsedUrl.pathname.substring(parsedUrl.pathname.lastIndexOf('/') + 1)
const contentType = !infoRequest ? { 'content-type': `application/x-${service}-request` } : {}

/** @type {https.RequestOptions} */
const requestOptions = {
  host: parsedUrl.host,
  path: parsedUrl.pathname + parsedUrl.search,
  method: infoRequest ? 'GET' : 'POST',
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
    console.log(body);
  }).on('error', (e) => {
    console.error(`Error: ${e.message}`);
  })
})

if (body) {
  req.write(Buffer.from(body, 'base64'))
}

req.end()


