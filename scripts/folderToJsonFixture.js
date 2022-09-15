var path = require('path');
const fs = require('fs')

const [folderPath] = process.argv.slice(2)

let jsonObj = {}
readFolder(folderPath, jsonObj)

const data = JSON.stringify(jsonObj, null, 2);
fs.writeFileSync(path.join(path.dirname(folderPath), `${path.basename(folderPath)}.json`), data)

/**
 *
 * @param {string} path
 * @param {object} jsonObj
 */
function readFolder(folderPath, obj) {
  const treeEntries = fs.readdirSync(folderPath)

  for (const treeEntryName of treeEntries) {
    const treeEntryPath = path.join(folderPath, treeEntryName)
    const treeEntryStat = fs.statSync(treeEntryPath)

    if (treeEntryStat.isFile()) {
      const data = fs.readFileSync(treeEntryPath)
      const isBinaryData = isBinary(data)
      const content = data.toString(isBinaryData ? 'base64' : 'utf8')
      const encoding = isBinaryData ? {} : { encoding: 'utf8' }
      obj[treeEntryName] = { type: 'file', content, ...encoding }
    } else if (treeEntryStat.isSymbolicLink()) {
      obj[treeEntryName] = { type: 'symlink', target: fs.readlinkSync(treeEntryPath) }
    } else if (treeEntryStat.isDirectory()) {
      const children = {}
      obj[treeEntryName] = { type: 'dir', children }
      readFolder(treeEntryPath, children)
    }
  }
}

/**
 * @param {Uint8Array} buffer
 */
function isBinary(buffer) {
  // in canonical git, this check happens in builtins/merge-file.c
  // but I think it's DRYer to do it here.
  // The value picked is explained here: https://github.com/git/git/blob/ab15ad1a3b4b04a29415aef8c9afa2f64fc194a2/xdiff-interface.h#L12
  const MAX_XDIFF_SIZE = 1024 * 1024 * 1023
  if (buffer.length > MAX_XDIFF_SIZE) return true
  // check for null characters in the first 8000 bytes
  return buffer.slice(0, 8000).some(value => value === 0)
}
