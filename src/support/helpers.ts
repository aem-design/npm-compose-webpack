import { readFileSync } from 'fs'
import { resolve } from 'path'

import _get from 'lodash/get'
import xml2js from 'xml2js'

import { getIfUtils, IfUtils, IfUtilsFn } from 'webpack-config-utils'

import type {
  ComposeConfiguration,
  RuntimeEnvironment,
} from '../types'

import {
  ConfigurationType,
} from '../types/enums'

import type {
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
export function getMavenConfigurationValueByPath<R>({ fallback, parser, paths, pom }: MavenConfig<R>): R {
  let value!: R

  const file = pom ?? getConfiguration(ConfigurationType.MAVEN_PARENT)

  xmlParser.parseString(getMavenConfigurationFromFile(file), (_: any, { project }: any) => {
    const properties = project.properties[0]

    for (const path of paths) {
      value = _get(properties, path)

      if (!value || value === undefined || !Array.isArray(value)) {
        continue
      }

      value = typeof parser === 'function' ? parser(value) : value[0]
    }
  })

  return value || fallback as R
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
