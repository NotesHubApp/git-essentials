var path = require('path');
const fs = require('fs')

const [folderPath] = process.argv.slice(2)

let dataObj = []
readFolder(folderPath, dataObj)

const dataStr = JSON.stringify(dataObj, null, 2);
fs.writeFileSync(path.join(path.dirname(folderPath), `${path.basename(folderPath)}.json`), dataStr)

/**
 *
 * @param {string} folderPath
 * @param {Array} obj
 */
function readFolder(folderPath, obj) {
  const treeEntries = fs.readdirSync(folderPath).map(x => ({
      treeEntryName: x,
      treeEntryPath: path.join(folderPath, x),
      treeEntryStat: fs.statSync(path.join(folderPath, x))
    }))

  treeEntries.sort((a, b) => {
    if (
      (a.treeEntryStat.isDirectory() && b.treeEntryStat.isDirectory()) ||
      (a.treeEntryStat.isFile() && b.treeEntryStat.isFile()) ||
      (a.treeEntryStat.isSymbolicLink() && b.treeEntryStat.isSymbolicLink())) {
      return stringComparer(a.name, b.name);
    } else if (a.treeEntryStat.isDirectory() && (b.treeEntryStat.isFile() || b.treeEntryStat.isSymbolicLink())) {
      return -1;
    } else {
      return 1;
    }
  })

  for (const { treeEntryName, treeEntryPath, treeEntryStat } of treeEntries) {
    if (treeEntryStat.isFile()) {
      const data = fs.readFileSync(treeEntryPath)
      const encoding = isBinary(data) ? 'base64' : 'utf8'
      const content = data.toString(encoding)
      obj.push({ name: treeEntryName, type: 'file', encoding, content })
    } else if (treeEntryStat.isSymbolicLink()) {
      obj.push({ name: treeEntryName, type: 'symlink', target: fs.readlinkSync(treeEntryPath) })
    } else if (treeEntryStat.isDirectory()) {
      const children = []
      obj.push({ name: treeEntryName, type: 'dir', children })
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
  const hasNullChar = buffer.slice(0, 8000).some(value => value === 0)
  if (hasNullChar) return true

  // check for known headers
  const magicNumbers = [
    [0x78, 0x01], // zlib (no compression/low)
    [0x78, 0x9C], // zlib (default compression)
    [0x78, 0xDA], // zlib (best Compression)
  ]

  for (const header of magicNumbers) {
    if (buffer.byteLength >= header.length && header.every((v, i) => v === buffer[i])) {
      return true
    }
  }

  return false
}


/**
 * @param {string} a
 * @param {string} b
 * @returns
 */
function stringComparer(a, b) {
  if (a < b) { return -1; }
  if (a > b) { return 1; }
  return 0;
}
