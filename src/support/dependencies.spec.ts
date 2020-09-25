import mockConsole from 'jest-mock-console'

import {
  DependencyType,
  InstallStatus,
} from '../types/enums'

import {
  constructCommand,
  installDependencies,
  resolveDependency,
} from './dependencies'

jest.mock('child_process').mock('fs')

jest.mock('@aem-design/compose-support', () => ({
  logger: {
    info: jest.fn(),
  },
}))

describe('dependencies', () => {
  test('should resolve dependencies', () => {
    const spy = jest.spyOn(require, 'resolve')

    expect(resolveDependency('fs')).toEqual('fs')
    expect(resolveDependency('path')).toEqual('path')

    spy.mockRestore()
  })

  test('should catch dependency error and return fallback', () => {
    expect(resolveDependency('mock-module', true, 'non-existent')).toEqual('non-existent')
  })

  test('can install dependencies', () => {
    const restoreConsoleMock = mockConsole()

    const installStatus = installDependencies({
      [DependencyType.DEV]     : ['yo'],
      [DependencyType.NON_DEV] : ['foo'],
    })

    expect(installStatus).toEqual(InstallStatus.RESTART)

    restoreConsoleMock()
  })

  test('dependencies install should be skipped', () => {
    const installStatus = installDependencies({
      [DependencyType.DEV]     : ['path'],
      [DependencyType.NON_DEV] : ['fs'],
    })

    expect(installStatus).toEqual(InstallStatus.SKIPPED)
  })

  test('npm install command should be generated for non dev dependencies', () => {
    expect(constructCommand(['yo'], DependencyType.NON_DEV)).toEqual('npm install yo')
  })

  test('npm install command should be generated for dev dependencies', () => {
    expect(constructCommand(['yo'], DependencyType.DEV)).toEqual('npm install yo --save-dev')
  })

  test('version constraint is honoured in the install command', () => {
    expect(constructCommand(['yo@1.0.0'], DependencyType.DEV)).toEqual('npm install yo@1.0.0 --save-dev')
  })
})
