import { existsSync } from 'fs'
import { resolve } from 'path'
import mockConsole from 'jest-mock-console'

import {
  DependencyType,
  InstallStatus,
} from '../types/enums'

import {
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
  let restoreConsoleMock

  beforeAll(() => {
    restoreConsoleMock = mockConsole()
  })

  test('existsSync was called for yarn.lock', () => {
    expect(existsSync).toHaveBeenCalledWith(resolve(process.cwd(), 'yarn.lock'))
  })

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
    const installStatus = installDependencies({
      [DependencyType.DEV]     : ['yo'],
      [DependencyType.NON_DEV] : [],
    })

    expect(installStatus).toEqual(InstallStatus.RESTART)
  })

  afterAll(() => {
    restoreConsoleMock()
  })
})
