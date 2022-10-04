const playwright = require('playwright')
process.env.CHROME_BIN = playwright.chromium.executablePath()
process.env.WEBKIT_HEADLESS_BIN = playwright.webkit.executablePath()
process.env.FIREFOX_BIN = playwright.firefox.executablePath()

module.exports = (config: any) => {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'karma-typescript'],
    plugins: [
      'karma-jasmine',
      'karma-typescript',
      'karma-jasmine-html-reporter',
      'karma-chrome-launcher',
      'karma-webkit-launcher',
      'karma-firefox-launcher'
    ],
    client: {
      captureConsole: true,
      clearContext: false // will show the results in browser once all the testcases are loaded
    },
    // To avoid DISCONNECTED messages
    browserDisconnectTimeout: 10000,          // default 2000
    browserDisconnectTolerance: 2,            // default 0
    browserNoActivityTimeout: 4 * 60 * 1000,  // default 10000
    captureTimeout: 4 * 60 * 1000,            // default 60000
    files: [
      "src/**/*.ts",
      "tests/**/*.ts",
    ],
    preprocessors: {
      "**/*.ts": "karma-typescript"
    },
    karmaTypescriptConfig: {
      exclude: ["node_modules", "dist"],
      compilerOptions: {
        "target": "es6",
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noFallthroughCasesInSwitch": true,
        "resolveJsonModule": true,
        "esModuleInterop": true,
        "baseUrl": ".",
        "paths": {
          "git-essentials": ["./src/index"]
        }
      },
      bundlerOptions: {
        addNodeGlobals: true
      }
    },
    reporters: ['kjhtml'],
    browsers: []
  })
}
