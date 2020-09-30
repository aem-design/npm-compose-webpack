const { pathsToModuleNameMapper } = require('ts-jest/utils')

const { compilerOptions } = require('./tsconfig')

module.exports = {
  collectCoverage      : true,
  preset               : 'ts-jest',
  moduleFileExtensions : ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper     : pathsToModuleNameMapper(compilerOptions.paths),
  reporters            : ['default'],
  roots                : ['<rootDir>/src'],
  testRegex            : '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  verbose              : true,

  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.es5.json',
    },
  },

  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
