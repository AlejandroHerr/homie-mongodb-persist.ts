// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  coverageDirectory: 'coverage',
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  testMatch: ['**/src/**/?(*.)+(spec).[jt]s'],
};
