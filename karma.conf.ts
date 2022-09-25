const playwright = require('playwright')
process.env.WEBKIT_HEADLESS_BIN = playwright.webkit.executablePath()

module.exports = (config: any) => {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'karma-typescript'],
    plugins: [
      'karma-jasmine',
      'karma-typescript',
      'karma-jasmine-html-reporter',
      'karma-electron-launcher',
      'karma-chrome-launcher',
      'karma-webkit-launcher',
      'karma-safari-launcher'
    ],
    client: {
      clearContext: false // will show the results in browser once all the testcases are loaded
    },
    files: [
      "src/**/*.ts",
      "tests/**/*.ts",
    ],
    preprocessors: {
      "**/*.ts": "karma-typescript"
    },
    karmaTypescriptConfig: {
      exclude: ["node_modules"],
      compilerOptions: {
        "target": "es6",
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noFallthroughCasesInSwitch": true,
        "resolveJsonModule": true,
        "esModuleInterop": true,
      },
      bundlerOptions: {
        addNodeGlobals: true
      }
    },
    reporters: ['kjhtml'],
    browsers: []
  })
}
