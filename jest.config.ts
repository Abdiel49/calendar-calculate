import type { Config } from 'jest';

const config: Config = {
  // Use ts-jest to compile TypeScript test files on the fly
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Disable Watchman (avoids issues with broken system libfmt on macOS)
  watchman: false,
  // Tell ts-jest to use the test-specific tsconfig (CommonJS, strict)
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },

  // Resolve .ts extensions so imports without extension work
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Roots for test discovery
  roots: ['<rootDir>/tests'],

  // Naming conventions
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/e2e/**/*.test.ts',
  ],

  // Coverage (collected from src only)
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};

export default config;
