const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const scriptArgs = process.argv.slice(2)
const [url, payload] = scriptArgs

const parsedUrl = new URL(url)
const infoRequest = parsedUrl.pathname.endsWith('/info/refs')

const service = infoRequest ?
  parsedUrl.searchParams.get('service') :
  parsedUrl.pathname.substring(parsedUrl.pathname.lastIndexOf('/') + 1)

const args = ['--stateless-rpc' ]
if (infoRequest) {
  args.push('--advertise-refs')
}
args.push(gitdir)

const ps = spawn(service, args)
ps.stdout.on('data', (data) => {
  console.log('child:: '+ String(data))
})

if (payload) {
  ps.stdin.write(Buffer.from(payload, 'base64'))
}
