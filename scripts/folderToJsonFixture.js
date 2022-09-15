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
      const content = fs.readFileSync(treeEntryPath).toString('base64')
      obj[treeEntryName] = { type: 'file', content }
    } else if (treeEntryStat.isSymbolicLink()) {
      obj[treeEntryName] = { type: 'symlink', target: fs.readlinkSync(treeEntryPath) }
    } else if (treeEntryStat.isDirectory()) {
      const children = {}
      obj[treeEntryName] = { type: 'dir', children }
      readFolder(treeEntryPath, children)
    }
  }
}
