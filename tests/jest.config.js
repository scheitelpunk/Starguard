/**
 * Jest Configuration for STARGUARD Security Test Suite
 * Comprehensive testing configuration for all security systems
 */

export default {
  // Test environment
  testEnvironment: 'node',
  
  // Module configuration
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Globals
  globals: {
    'ts-jest': {
      useESM: true,
      isolatedModules: true
    }
  },
  
  // Module paths and mappings
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/backend/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@mocks/(.*)$': '<rootDir>/tests/mocks/$1'
  },
  
  // Test match patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Coverage configuration - >90% requirement
  collectCoverageFrom: [
    'backend/src/**/*.{ts,js}',
    '!backend/src/**/*.d.ts',
    '!backend/src/**/index.ts',
    '!backend/src/types/**/*'
  ],
  
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './backend/src/consciousness/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './backend/src/threats/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './backend/src/ml/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './backend/src/quantum/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Coverage reporting
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],
  
  // Test timeout for async operations
  testTimeout: 30000,
  
  // Parallel execution
  maxWorkers: '50%',
  
  // Reporters
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/html-report',
      filename: 'report.html',
      expand: true
    }]
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true
    }],
    '^.+\\.jsx?$': ['babel-jest']
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Clear mocks automatically
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Verbose output for debugging
  verbose: true,
  
  // Test environments
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.{ts,js}'],
      testEnvironment: 'node'
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.{ts,js}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts']
    },
    {
      displayName: 'performance',
      testMatch: ['<rootDir>/tests/performance/**/*.test.{ts,js}'],
      testEnvironment: 'node',
      testTimeout: 60000
    },
    {
      displayName: 'security',
      testMatch: ['<rootDir>/tests/security/**/*.test.{ts,js}'],
      testEnvironment: 'node',
      testTimeout: 45000
    }
  ]
};