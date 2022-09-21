const { spawn } = require('child_process')

const scriptArgs = process.argv.slice(2)
const [url, payload] = scriptArgs

const parsedUrl = new URL(url)
const infoRequest = parsedUrl.pathname.endsWith('/info/refs')
const method = infoRequest ? 'GET' : 'POST'
const service = infoRequest ?
  parsedUrl.searchParams.get('service') :
  parsedUrl.pathname.substring(parsedUrl.pathname.lastIndexOf('/') + 1)

const repoName = parsedUrl.pathname.split('/')[1]
const gitdir = `tests/fixtures/remotes/${repoName}`

const args = ['--stateless-rpc', '--strict']
if (infoRequest) {
  args.push('--advertise-refs')
}
args.push(gitdir)


const gitServiceProcess = spawn(service, args)
gitServiceProcess.stderr.on('data', (error) => {
  throw new Error(error)
})

const chunks = []
gitServiceProcess.stdout.on('data', (data) => {
  chunks.push(data)
})

gitServiceProcess.on('close', () => {
  if (infoRequest) {
    chunks.unshift(Buffer.from(pack('# service=' + service + '\n') + '0000'))
  }
  const response = Buffer.concat(chunks)
  const fixture = generateFixture(response)

  const jsonFixture = JSON.stringify(fixture, null, 2)

  console.log('Copy generated fixture below into your HttpFixure file:\n')
  console.log(jsonFixture)
})

if (payload) {
  gitServiceProcess.stdin.write(Buffer.from(payload, 'base64'))
}


/**
 * @param {string} s
 */
function pack (s) {
  var n = (4 + s.length).toString(16);
  return Array(4 - n.length + 1).join('0') + n + s;
}

/**
 * @param {Buffer} responseBody
 */
function generateFixture(responseBody) {
  const requestContentType = !infoRequest ? { contentType: `application/x-${service}-request` } : {}
  let requestBody = {}
  if (payload) {
    const requestEncoding = service !== 'git-receive-pack' ? 'utf8' : 'base64'
    requestBody = { encoding: requestEncoding, body: Buffer.from(payload, 'base64').toString(requestEncoding) }
  }
  const responseEncoding = infoRequest ? 'utf8' : 'base64'
  const responseContentType = `application/x-${service}-${ infoRequest ? 'advertisement' : 'result' }`

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
