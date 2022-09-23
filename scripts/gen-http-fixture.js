const { spawn } = require('child_process')
const https = require('https')
const path = require('path')
const fs = require('fs')

const scriptArgs = process.argv.slice(2)
const [url, payload] = scriptArgs

const parsedUrl = new URL(url)
const infoRequest = parsedUrl.pathname.endsWith('/info/refs')
const method = infoRequest ? 'GET' : 'POST'
const service = infoRequest ?
  parsedUrl.searchParams.get('service') :
  parsedUrl.pathname.substring(parsedUrl.pathname.lastIndexOf('/') + 1)
const isLocalRepo = parsedUrl.hostname === 'localhost'

if (isLocalRepo) {
  printFixtureForLocalRepo()
} else {
  printFixtureForRemoteRepo()
}

function printFixtureForRemoteRepo() {
  const contentType = !infoRequest ?
  { 'content-type': `application/x-${service}-request` } :
  {}

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
      const fixture = generateFixture(body)
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
}

function printFixtureForLocalRepo() {
  const repoName = parsedUrl.pathname.split('/')[1]
  const gitdir = `tests/fixtures/remotes/${repoName}`

  // copy original gitdir to temp directory to not override anything by push command
  const tempRepoName = generateId(20)
  const gitdirTemp = `tests/fixtures/remotes/${tempRepoName}`
  copyRecursiveSync(gitdir, gitdirTemp)

  const args = ['--stateless-rpc']
  if (infoRequest) {
    args.push('--advertise-refs')
  }
  args.push(gitdirTemp)

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

    fs.rmSync(gitdirTemp, { recursive: true, force: true })
  })

  if (payload) {
    gitServiceProcess.stdin.write(Buffer.from(payload, 'base64'))
  }
}

/************************************************************ */
// Utilities
/************************************************************ */

/**
 * @param {string} s
 */
 function pack(s) {
  var n = (4 + s.length).toString(16);
  return Array(4 - n.length + 1).join('0') + n + s;
}

/**
 * Copy directory recursively
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
 function copyRecursiveSync(src, dest) {
  var exists = fs.existsSync(src)
  var stats = exists && fs.statSync(src)
  var isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    fs.mkdirSync(dest)
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

/**
 * Generate random id
 * @param {number} length
 */
 function generateId(length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
 }
 return result
}

/**
 * Generate HTTP fixture object
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
