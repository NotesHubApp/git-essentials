const path = require('path')
const fs = require('fs')

const baseTypesFolder = path.join('dist', 'types')
const publicApiTypeDeclarations = [
  "index.d.ts",
  "index.d.ts.map",
  "api",
  "clients",
  "errors",
  "models"
]


// We need to include only Public API TypeScript declarations
const typeFoldersToDelete = fs.readdirSync(baseTypesFolder).filter(x => !publicApiTypeDeclarations.includes(x))
for (const typeFolder of typeFoldersToDelete) {
  fs.rmSync(path.join(baseTypesFolder, typeFolder), { recursive: true, force: true })
}

// Copy package.json file
fs.copyFileSync('package.json', 'dist/package.json')
