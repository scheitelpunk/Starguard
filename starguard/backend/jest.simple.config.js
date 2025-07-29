module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/backend/src/**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      isolatedModules: true,
      tsconfig: {
        moduleResolution: 'node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true
      }
    }]
  },
  moduleNameMapper: {
    '^@starguard/shared$': '<rootDir>/../shared/src/index.ts'
  },
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    '!backend/src/**/*.d.ts',
    '!backend/src/**/__tests__/**',
    '!backend/src/index.ts'
  ]
};