import { readFileSync } from 'fs'
import { resolve } from 'path'

import _get from 'lodash/get'
import xml2js from 'xml2js'

import {
  getIfUtils,
  IfUtils,
  IfUtilsFn,
} from 'webpack-config-utils'

import type {
  ComposeConfiguration,
  RuntimeEnvironment,
  RuntimeForWebpack,
} from '@/types'

import type {
  MavenConfig,
  SavedMavenConfig,
} from '@/types/maven'

import {
  WebpackConfiguration,
} from '@/types/webpack'

import {
  environment,
} from '@/config'

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

const baseEnvironmentConfig: RuntimeEnvironment = {
  paths: {},
} as RuntimeEnvironment

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

  mavenConfigs[filePath] = readFileSync(resolve(filePath), 'utf-8')
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

  xmlParser.parseString(getMavenConfigurationFromFile(pom), (_: any, { project }: any) => {
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
export function configurationProxy(configuration: Partial<ComposeConfiguration>): Partial<ComposeConfiguration> {
  return configuration
}

/**
 * Generates the configuration structure needed for the given `context`.
 */
export function generateConfiguration(
  configuration: RuntimeForWebpack,
  environmentConfiguration?: RuntimeEnvironment,
): WebpackConfiguration {
  if (configuration instanceof Function) {
    return configuration(environmentConfiguration ?? baseEnvironmentConfig)
  }

  return configuration || {}
}

/**
 * Attempts to resolve `filename` in the given paths (if any) otherwise uses the `fallback` path
 * which is relative to the root of `@aem-design/compose-webpack` package.
 */
export function resolveConfigFile(
  filename: string,
  fallback: string,
  paths: string[] = [],
): string {
  for (const path of [...paths, process.cwd()]) {
    try {
      return require.resolve(filename, { paths: [path] })
    } catch (_) {
      // Keep going through the paths
    }
  }

  return resolve(__dirname, '../../', fallback)
}
