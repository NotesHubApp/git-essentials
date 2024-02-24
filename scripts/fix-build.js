import fs from 'fs'
import path from 'path'

// Delete empty TypeScript declarations
deleteEmptyTypeScriptDeclarations('dist/types')

/**
 * Delete empty TypeScript declarations
 * @param {string} folderPath
 */
function deleteEmptyTypeScriptDeclarations(folderPath) {
  const folderItems = fs.readdirSync(folderPath)

  for (const folderItem of folderItems) {
    // if map file it could be already deleted, we need to skip
    if (folderItem.endsWith('.d.ts.map')) {
      continue
    }

    const itemPath = path.join(folderPath, folderItem)
    const stat = fs.statSync(itemPath)

    if (stat.isFile() && folderItem.endsWith('.d.ts')) {
      if (fs.readFileSync(itemPath, { encoding: 'utf8' }).includes('export {};')) {
        fs.unlinkSync(itemPath)
        fs.unlinkSync(itemPath.replace('.d.ts', '.d.ts.map'))
      }
    } else if (stat.isDirectory()) {
      deleteEmptyTypeScriptDeclarations(itemPath)
    }
  }

  if (fs.readdirSync(folderPath).length === 0) {
    fs.rmdirSync(folderPath)
  }
}
