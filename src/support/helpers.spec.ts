import fs from 'fs'

import {
  setupEnvironment,
} from '../config'

import { Environment } from '../types'

import {
  configurationProxy,
  generateConfiguration,
  getIfUtilsInstance,
  getMavenConfigurationValueByPath,
} from './helpers'

jest.mock('fs')

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

  test('can load pom xml configuration', () => {
    // @ts-expect-error no types exist for mocks
    fs.readFileSync.mockReturnValue(`<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <properties>
    <mock.prop>foo</mock.prop>
  </properties>
</project>`)

    expect(getMavenConfigurationValueByPath({
      fallback : null,
      path     : 'mock.prop',
      pom      : 'mock.xml',
    })).toStrictEqual('foo')
  })

  test('stored xml configuration is loaded', () => {
    // @ts-expect-error no types exist for mocks
    fs.readFileSync.mockClear()

    expect(getMavenConfigurationValueByPath({
      fallback : null,
      path     : 'mock.prop',
      pom      : 'mock.xml',
    })).toStrictEqual('foo')
  })

  test('parser returns custom value', () => {
    expect(getMavenConfigurationValueByPath({
      fallback : null,
      parser   : (value) => `${value}.bar`,
      path     : 'mock.prop',
      pom      : 'mock.xml',
    })).toStrictEqual('foo.bar')
  })
})
