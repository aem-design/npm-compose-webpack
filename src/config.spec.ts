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

    // @ts-expect-error 'mock' is not a real environment mode
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

    // @ts-expect-error 'foo' is actually invalid
    expect(() => setConfigurable('foo', ['bar'])).toThrow(/Unable to update webpack configurable/)

    // @ts-expect-error 'foo' is actually invalid
    expect(() => getConfigurable('foo')).toThrow(/Unable to get webpack configurable/)
  })

  test('invalid configuration key should throw an error', () => {
    expect(setConfiguration).toThrow(/Unable to set configuration/)

    expect(getConfiguration).toThrow(/Unable to get configuration/)

    // @ts-expect-error 'foo' is actually invalid
    expect(() => setConfiguration('foo', 'bar')).toThrow(/Unable to set configuration/)

    // @ts-expect-error 'foo' is actually invalid
    expect(() => getConfiguration('foo')).toThrow(/Unable to get configuration/)
  })

  test('configuration for maven project key should be set', () => {
    setConfiguration(ConfigurationType.MAVEN_PROJECT, 'foo bar')

    expect(getConfiguration(ConfigurationType.MAVEN_PROJECT)).toEqual('foo bar')
  })

  test('invalid project configuration should return default configuration', () => {
    setProjects({}, true)

    environment.project = 'styleguide'

    expect(getProjectConfiguration()).toHaveProperty('entryFile', 'styleguide.ts')
  })

  test('incoming project configuration should merge with default core project', () => {
    setProjects({
      core: {
        entryFile  : 'mock.ts',
        outputName : 'mock',

        additionalEntries: {
          'foo': ['es6-promise/auto'],
          'bar': ['classlist.js'],

          'vendorlib/common': [
            'bootstrap/foo',
          ],
        },

        fileMap: {
          footer: ['foo'],
          header: ['bar'],
        },
      },
    }, true)

    environment.project = 'core'

    expect(getProjectConfiguration()).toHaveProperty('entryFile', 'mock.ts')
    expect(getProjectConfiguration()).toHaveProperty('outputName', 'mock')

    expect(getProjectConfiguration()).toHaveProperty(['additionalEntries', 'bar', 0], 'classlist.js')
    expect(getProjectConfiguration()).toHaveProperty(['additionalEntries', 'vendorlib/common', 7], 'bootstrap/foo')

    expect(getProjectConfiguration()).toHaveProperty(['fileMap', 'footer', 0], 'foo')
  })

  test('incoming project configuration should merge with default styleguide project', () => {
    setProjects({
      styleguide: {
        entryFile  : 'mock.ts',
        outputName : 'mock',

        additionalEntries: {
          'foo': ['bar'],
        },

        fileMap: {
          footer: undefined,
          header: ['foo'],
        },
      },
    }, true)

    environment.project = 'styleguide'

    expect(getProjectConfiguration()).toHaveProperty('entryFile', 'mock.ts')
    expect(getProjectConfiguration()).toHaveProperty('outputName', 'mock')

    expect(getProjectConfiguration()).toHaveProperty(['additionalEntries', 'foo', 0], 'bar')

    expect(getProjectConfiguration()).toHaveProperty(['fileMap', 'header', 0], 'foo')
  })

  test('incoming project with invalid configuration should merge with default core project', () => {
    setProjects({
      core: {
        entryFile  : null as unknown as string,
        fileMap    : undefined,
        outputName : null as unknown as string,
      },
    }, true)

    environment.project = 'core'

    expect(getProjectConfiguration()).toHaveProperty('entryFile', 'mock.ts')
    expect(getProjectConfiguration()).toHaveProperty('outputName', 'mock')

    expect(getProjectConfiguration()).toHaveProperty(['additionalEntries', 'vendorlib/common', 0], './core/js/vendor.ts')

    expect(getProjectConfiguration()).toHaveProperty(['fileMap', 'header', 0], 'vendorlib/common')
  })
})
