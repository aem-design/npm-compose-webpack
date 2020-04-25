import { readFileSync } from 'fs'
import { resolve } from 'path'

import _get from 'lodash/get'
import xml2js from 'xml2js'

import { getIfUtils, IfUtils, IfUtilsFn } from 'webpack-config-utils'

import {
  ComposeConfiguration,
  RuntimeEnvironment,
} from '../types'

import {
  ConfigurationType,
} from '../types/enums'

import {
  MavenConfig,
  SavedMavenConfig,
} from '../types/maven'

import {
  environment,

  getConfiguration,
} from '../config'

// Internal
const envVars = [
  'analyzer',
  'clean',
  'dev',
  'development',
  'eslint',
  'maven',
  'prod',
  'production',
  'stylelint',
  'test',
  'watch',
]

const mavenConfigs: SavedMavenConfig = {}
const xmlParser: xml2js.Parser = new xml2js.Parser()

const baseEnvironmentConfig: Partial<RuntimeEnvironment> = {
  paths: {},
}

let ifUtilsInstance: ComposeIfUtils | null = null

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

export interface ComposeIfUtils extends IfUtils {
  ifAnalyzer: IfUtilsFn;
  ifNotAnalyzer: IfUtilsFn;
  ifClean: IfUtilsFn;
  ifNotClean: IfUtilsFn;
  ifEslint: IfUtilsFn;
  ifNotEslint: IfUtilsFn;
  ifMaven: IfUtilsFn;
  ifNotMaven: IfUtilsFn;
  ifStylelint: IfUtilsFn;
  ifNotStylelint: IfUtilsFn;
}

/**
 * Gets the Maven configuration from the file system and returns the value requested.
 */
export function getMavenConfigurationValueByPath<R>({ fallback, parser, path: propPath, pom }: MavenConfig<R>): R {
  let value!: R

  const file = pom ?? getConfiguration(ConfigurationType.MAVEN_PARENT)

  xmlParser.parseString(getMavenConfigurationFromFile(file), (_: any, { project }: any) => {
    const properties = project.properties[0]

    value = _get(properties, propPath, fallback)

    if (parser) {
      value = parser(value)
    } else {
      value = value[0]
    }
  })

  return value
}

/**
 * Create an if utilities instance.
 */
export function getIfUtilsInstance(): ComposeIfUtils {
  if (!ifUtilsInstance) {
    ifUtilsInstance = getIfUtils(environment, envVars) as ComposeIfUtils
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
    return configuration(environmentConfiguration ?? baseEnvironmentConfig) as T
  }

  return configuration || {} as T
}

/**
 * Attempts to resolve the `expected` path otherwise uses the `fallback` path.
 */
export function resolveConfigFile(expected: string, fallback: string): string {
  try {
    return require.resolve(expected, { paths: [process.cwd()] })
  } catch (_) {
    return resolve(__dirname, '../../', fallback)
  }
}
