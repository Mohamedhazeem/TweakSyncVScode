const moduleNameMapper = {
  '^@domain/(.*)$': '<rootDir>/src/domain/$1',
  '^@application/(.*)$': '<rootDir>/src/application/$1',
  '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  '^@webview/(.*)$': '<rootDir>/src/webview/$1',
  '^@/(.*)$': '<rootDir>/src/$1'
};

const transform = '<rootDir>/scripts/jest-babel-transform.cjs';

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'domain',
      testEnvironment: 'node',
      roots: ['<rootDir>/src/domain'],
      testMatch: ['**/*.test.ts'],
      transform: { '^.+\\.(ts|tsx)$': transform },
      moduleNameMapper
    },
    {
      displayName: 'application',
      testEnvironment: 'node',
      roots: ['<rootDir>/src/application'],
      testMatch: ['**/*.test.ts'],
      transform: { '^.+\\.(ts|tsx)$': transform },
      moduleNameMapper
    },
    {
      displayName: 'infrastructure',
      testEnvironment: 'node',
      roots: ['<rootDir>/src/infrastructure'],
      testMatch: ['**/*.test.ts'],
      transform: { '^.+\\.(ts|tsx)$': transform },
      moduleNameMapper
    },
    {
      displayName: 'webview',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/src/webview'],
      testMatch: ['**/*.test.tsx', '**/*.test.ts'],
      transform: { '^.+\\.(ts|tsx)$': transform },
      moduleNameMapper
    }
  ]
};
