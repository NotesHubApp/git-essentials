import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: [
      'tests/**/*.test.ts'
    ],
    video: false,
    screenshotOnRunFailure: false,
    experimentalWebKitSupport: true,
    supportFile: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  }
});
