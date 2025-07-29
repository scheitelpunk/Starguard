/** @type {import('jest').Config} */
const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@starguard/shared$': path.resolve(__dirname, '../shared/src/index.ts'),
    '^@starguard/shared/(.*)$': path.resolve(__dirname, '../shared/src/$1')
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        moduleResolution: 'node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }
  }
};