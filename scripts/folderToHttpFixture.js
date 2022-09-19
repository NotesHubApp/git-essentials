var spawn = require('child_process').spawn
var fs = require('fs')
var path = require('path')

const scriptArgs = process.argv.slice(2)
const [service, info, gitdir] = scriptArgs

const fixture = []

const args = ['--stateless-rpc' ]
if (info) { // TODO: Need actual check here
  args.push('--advertise-refs')
}
args.push(gitdir)

const ps = spawn(service, args, { env })
