import {
  getConfigurable,
  getConfiguration,
  getProjectConfiguration,
  getProjectPath,
  setConfigurable,
  setConfiguration,
  setProjects,
  setupEnvironment,
} from './config'

import { Environment } from './types'
import { ConfigurationType } from './types/enums'

describe('config', () => {
  let environment: Environment

  beforeEach(() => {
    environment = setupEnvironment({
      dev     : true,
      prod    : false,
      project : 'mock_project',
    })

    // @ts-ignore
    environment.mode = 'mock'

    setProjects()
  })

  test('project should not exist in default configuration', () => {
    expect(getProjectConfiguration()).toBeUndefined()
  })

  test('should return default core project output name', () => {
    environment.project = 'core'

    expect(getProjectConfiguration()).toHaveProperty('outputName', 'app')
  })

  test('empty environment configuration setup throws an error', () => {
    // @ts-ignore
    expect(() => setupEnvironment({})).toThrow(/Specify a project/)
  })

  test('empty projects configuration should assign default configuration', () => {
    setProjects({})

    expect(getProjectConfiguration()).toBeUndefined()

    environment.project = 'core'
    expect(getProjectConfiguration()).toHaveProperty('entryFile', 'app.ts')
  })

  test('should return expected project paths', () => {
    expect(getProjectPath(ConfigurationType.PATH_PUBLIC))
      .toMatch(new RegExp(`/public/${environment.project}$`))

    expect(getProjectPath(ConfigurationType.PATH_PUBLIC_AEM))
      .toMatch(new RegExp(`^/${environment.project}$`))

    expect(getProjectPath(ConfigurationType.PATH_SOURCE))
      .toMatch(new RegExp(`/src/${environment.project}$`))
  })

  test('custom project should be set', () => {
    setProjects({
      [environment.project]: {
        entryFile  : 'mock.ts',
        outputName : 'mock',
      },
    })

    expect(getProjectConfiguration()).toHaveProperty('outputName', 'mock')
  })

  test('configurable should be set', () => {
    setConfigurable('assetFilters', ['test'])

    expect(getConfigurable('assetFilters')).toContain('test')
  })

  test('invalid configurable should throw an error', () => {
    expect(setConfigurable).toThrow(/Unable to update webpack configurable/)

    expect(getConfigurable).toThrow(/Unable to get webpack configurable/)

    // @ts-ignore
    expect(() => setConfigurable('foo', ['bar'])).toThrow(/Unable to update webpack configurable/)

    // @ts-ignore
    expect(() => getConfigurable('foo')).toThrow(/Unable to get webpack configurable/)
  })

  test('invalid configuration key should throw an error', () => {
    expect(setConfiguration).toThrow(/Unable to set configuration/)

    expect(getConfiguration).toThrow(/Unable to get configuration/)

    // @ts-ignore
    expect(() => setConfiguration('foo', 'bar')).toThrow(/Unable to set configuration/)

    // @ts-ignore
    expect(() => getConfiguration('foo')).toThrow(/Unable to get configuration/)
  })

  test('configuration for maven project key should be set', () => {
    setConfiguration(ConfigurationType.MAVEN_PROJECT, 'foo bar')

    expect(getConfiguration(ConfigurationType.MAVEN_PROJECT)).toEqual('foo bar')
  })
})
