const { pathsToModuleNameMapper } = require('ts-jest/utils')

const { compilerOptions } = require('./tsconfig.json')

/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  collectCoverage      : process.env.NODE_ENV === 'test',
  preset               : 'ts-jest/presets/js-with-ts',
  moduleFileExtensions : ['ts', 'js', 'json', 'node'],
  reporters            : ['default'],
  roots                : ['<rootDir>/src', '<rootDir>/test'],
  testEnvironment      : 'node',
  testRegex            : '((\\.|/)(test|spec))\\.tsx?$',
  verbose              : true,

  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/types/**/*',
    '!<rootDir>/src/bin/cli-service.ts',
    '!<rootDir>/src/index.ts',
  ],

  displayName: {
    name  : require('./package.json').name,
    color : 'blue',
  },

  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.es5.json',
    },
  },

  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix : '<rootDir>/' }),
  },
}

module.exports = config
