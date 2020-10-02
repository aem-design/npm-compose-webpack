const { defaults }                = require('jest-config')
const { pathsToModuleNameMapper } = require('ts-jest/utils')

const { compilerOptions } = require('./tsconfig.json')

module.exports = {
  collectCoverage   : true,
  preset            : 'ts-jest',
  moduleNameMapper  : pathsToModuleNameMapper(compilerOptions.paths, { prefix: process.cwd() }),
  reporters         : ['default'],
  roots             : ['<rootDir>/src'],
  testRegex         : '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  verbose           : true,

  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.es5.json',
    },
  },

  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
