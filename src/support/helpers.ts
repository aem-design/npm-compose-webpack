import { readFileSync } from 'fs'
import { resolve } from 'path'

import _get from 'lodash/get'
import xml2js from 'xml2js'

import { getIfUtils, IfUtils } from 'webpack-config-utils'

import {
  ComposeConfiguration,
  RuntimeEnvironment,
} from '../types'

import {
  MavenConfig,
  SavedMavenConfig,
} from '../types/maven'

import { environment } from '../config'

// Internal
const mavenConfigs: SavedMavenConfig = {}
const xmlParser: xml2js.Parser = new xml2js.Parser()

const baseEnvironmentConfig: Partial<RuntimeEnvironment> = {
  paths: {},
}

let ifUtilsInstance: IfUtils | null = null

/**
 * Retrieve the Maven configuration using the given `filePath`.
 *
 * @private
 */
function getMavenConfigurationFromFile(filePath: string): string {
  if (mavenConfigs[filePath]) {
    return mavenConfigs[filePath]
  }

  mavenConfigs[filePath] = readFileSync(resolve(__dirname, filePath), 'utf-8')
  return mavenConfigs[filePath]
}

/**
 * Single exit point for the application.
 */
export const exit = process.exit

/**
 * Gets the Maven configuration from the file system and returns the value requested.
 */
export function getMavenConfigurationValueByPath<R>({ fallback, parser, path: propPath, pom }: MavenConfig<R>): R {
  let value!: R

  xmlParser.parseString(getMavenConfigurationFromFile(pom), (_: any, { project }: any) => {
    const properties = project.properties[0]

    value = _get(properties, propPath, fallback)

    if (parser) {
      value = parser(value)
    }
  })

  return value
}

/**
 * Create an if utilities instance.
 */
export function getIfUtilsInstance(): IfUtils {
  if (!ifUtilsInstance) {
    ifUtilsInstance = getIfUtils(environment, [
      'production',
      'prod',
      'test',
      'development',
      'dev',
      'analyzer',
      'maven',
      'clean',
    ])
  }

  return ifUtilsInstance
}

/**
 * Proxy helper that provides intellisense for generating configurations and allows the
 * environment configuration to be used via a callback function.
 */
export function configurationProxy(configuration: ComposeConfiguration): ComposeConfiguration {
  return configuration
}

/**
 * Generates the configuration structure needed for the given `context`.
 */
export function generateConfiguration<T>(configuration: T, environmentConfiguration?: RuntimeEnvironment): T {
  if (configuration instanceof Function) {
    return configuration(environmentConfiguration || baseEnvironmentConfig)
  }

  return configuration || {} as T
}
