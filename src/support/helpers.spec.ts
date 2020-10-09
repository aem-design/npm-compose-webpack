import path from 'path'
import mockFS from 'mock-fs'

import {
  setupEnvironment,
} from '@/config'

import { Environment } from '@/types'

import {
  configurationProxy,
  generateConfiguration,
  getIfUtilsInstance,
  getMavenConfigurationValueByPath,
} from '@/support/helpers'

import resolve from '../../test/helpers/resolve'

describe('helpers', () => {
  const fixturesPath = path.resolve(process.cwd(), 'test/fixtures')

  beforeEach(() => {
    mockFS({
      '/mock.pom.xml': mockFS.load(resolve('mock.pom.xml', fixturesPath)),
    })
  })

  test('should return our original configuration object', () => {
    const config = { foo: 'bar' }

    // @ts-expect-error only part of the 'config' object is given
    expect(configurationProxy(config)).toEqual(config)

    // @ts-expect-error this configuration is invalid on purpose
    expect(generateConfiguration(config)).toEqual(config)

    // @ts-expect-error this configuration is invalid on purpose
    expect(generateConfiguration(null)).toEqual({})

    // @ts-expect-error this configuration is invalid on purpose
    expect(generateConfiguration(() => config)).toEqual(config)
  })

  test('should return our environment mode', () => {
    const environment = { mode: 'development' }

    // @ts-expect-error only a partial environment object is available
    expect(generateConfiguration<(env: typeof environment) => string>((env) => env.mode, environment))
      .toEqual('development')
  })

  test('if utilities should be in mock mode', () => {
    const environment: Environment = setupEnvironment({
      mock    : true,
      prod    : false,
      project : 'mock_project',
    })

    // @ts-expect-error 'mock' is not a valid environment mode
    environment.mode = 'mock'

    expect(getIfUtilsInstance().ifDevelopment(true, false)).toBe(false)

    // TODO: Work out how to hook into `envVars` so we can create custom utility behaviours
    // expect(getIfUtilsInstance().ifMock(true, false)).toBe(true)

    expect(environment.mode).toEqual('mock')
  })

  test('can load pom xml configuration', () => {
    expect(getMavenConfigurationValueByPath({
      fallback : null,
      path     : 'mock.prop',
      pom      : '/mock.pom.xml',
    })).toStrictEqual('foo')
  })

  test('stored xml configuration is loaded', () => {
    mockFS.restore()

    expect(getMavenConfigurationValueByPath({
      fallback : null,
      path     : 'mock.prop',
      pom      : '/mock.pom.xml',
    })).toStrictEqual('foo')
  })

  test('parser returns custom value', () => {
    expect(getMavenConfigurationValueByPath({
      fallback : null,
      parser   : (value) => `${value}.bar`,
      path     : 'mock.prop',
      pom      : '/mock.pom.xml',
    })).toStrictEqual('foo.bar')
  })

  afterEach(() => {
    mockFS.restore()
  })
})
