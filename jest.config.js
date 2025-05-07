/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Tell Jest how to transform .ts files:
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json' // point to your tsconfig
        // any other ts-jest-specific options go here
      }
    ]
  },

  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  testMatch: ['**/__tests__/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)']
};
