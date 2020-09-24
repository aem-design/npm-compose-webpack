import {
  setupEnvironment,
} from '../config'

import { Environment } from '../types'

import {
  configurationProxy,
  generateConfiguration,
  getIfUtilsInstance,
} from './helpers'

describe('helpers', () => {
  test('should return our original configuration object', () => {
    const config = { foo: 'bar' }

    // @ts-expect-error
    expect(configurationProxy(config)).toEqual(config)

    expect(generateConfiguration(config)).toEqual(config)

    expect(generateConfiguration(null)).toEqual({})

    expect(generateConfiguration(() => config)).toEqual(config)
  })

  test('should return our environment mode', () => {
    const environment = { mode: 'development' }

    // @ts-expect-error
    expect(generateConfiguration<(env: typeof environment) => string>((env) => env.mode, environment))
      .toEqual('development')
  })

  test('if utilities should be in mock mode', () => {
    const environment: Environment = setupEnvironment({
      mock    : true,
      prod    : false,
      project : 'mock_project',
    })

    // @ts-expect-error
    environment.mode = 'mock'

    expect(getIfUtilsInstance().ifDevelopment(true, false)).toBe(false)

    // TODO: Work out how to hook into `envVars` so we can create custom utility behaviours
    // expect(getIfUtilsInstance().ifMock(true, false)).toBe(true)

    expect(environment.mode).toEqual('mock')
  })
})
