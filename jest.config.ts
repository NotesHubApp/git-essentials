import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^git-essentials$': '<rootDir>/src',
    '^git-essentials/(.+)$': '<rootDir>/src/$1',
  },
};

export default config
