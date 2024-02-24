const { addHook } = require('pirates')

const revert = addHook(
  (code, _filename) =>
    code
      .replace(/\nfunction parseConfig/, 'async function parseConfig')
      .replace('require(configFilePath)', '(await import(configFilePath)).default'),
  {
    exts: ['.js'],
    ignoreNodeModules: false,
    matcher: filename => filename.endsWith('node_modules/karma/lib/config.js')
  }
);

void revert
