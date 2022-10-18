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
    ['jest-junit', { outputDirectory: 'reports', outputName: 'report.xml' }],
  ],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['lcov', 'cobertura']
}

export default config
