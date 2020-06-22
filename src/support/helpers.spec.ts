import {
  configurationProxy,
  generateConfiguration,
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
    expect(generateConfiguration<(env: typeof environment) => void>((env) => env.mode, environment)).toEqual('development')
  })
})
