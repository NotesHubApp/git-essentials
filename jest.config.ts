import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: [
    "dist"
  ],
  moduleNameMapper: {
    '^git-essentials$': '<rootDir>/src',
    '^git-essentials/(.+)$': '<rootDir>/src/$1',
    '^src/(.+)$': '<rootDir>/src/$1'
  },
  reporters: [
    'default',
    'github-actions'
  ],
  collectCoverageFrom: ['src/**/*.ts']
}

export default config
