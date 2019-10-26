import { resolve } from 'path'
import webpack from 'webpack'

import { logger } from '@aem-design/compose-support'

import { ConfigurationType } from './@types/enum'
import { Project } from './@types/interface'

import { getMavenConfigurationValueByPath } from './helpers'

import { defaultProjects } from './defaults'

// Ensure our types get generated
export { ConfigurationType, Project }

// Internal
const workingDirectory = process.cwd()

const configurationDefaults: Configuration = {
  [ConfigurationType.MAVEN_PARENT]    : resolve(workingDirectory, '../pom.xml'),
  [ConfigurationType.MAVEN_PROJECT]   : resolve(workingDirectory, './pom.xml'),
  [ConfigurationType.PATH_CLIENTLIBS] : false,
  [ConfigurationType.PATH_PUBLIC]     : resolve(workingDirectory, 'public'),
  [ConfigurationType.PATH_PUBLIC_AEM] : '/',
  [ConfigurationType.PATH_SOURCE]     : resolve(workingDirectory, 'src'),
}

const configuration: Configuration = {
  ...configurationDefaults,
}

const configKeys = Object.values(ConfigurationType)

let projects: ProjectMap = {}

/**
 * Sets the required projects map. If none are supplied, the default map will be used instead.
 *
 * @param {ProjectMap} incomingProjects User defined projects to watch and build
 */
export function setProjects(incomingProjects: ProjectMap) {
  if (!incomingProjects || Object.keys(incomingProjects).length === 0) {
    projects = defaultProjects
  } else {
    projects = incomingProjects
  }
}

/**
 * Environment configuration for Webpack.
 * @var {Environment}
 */
export let environment: Environment = {
  mode    : 'development',
  project : '',
}

/**
 * Retrieve a stored configuration value by the given `key`.
 *
 * @param {ConfigurationType} key Configuration key
 * @return {*}
 */
export function getConfiguration<T extends ConfigurationType, R extends Configuration[T]>(key: T): R {
  if (!configKeys.includes(key)) {
    throw new ReferenceError(`Unable to get configuration for ${key} as it isn't a valid configuration key. Avaliable configuration keys to use are:\n${configKeys.join(', ')}\n`)
  }

  return configuration[key] as R
}

/**
 * Store a new `value` for the given `key`.
 *
 * @param {ConfigurationType} key Configuration key
 * @param {*} value Configuration value
 * @return {void}
 */
export function setConfiguration<T extends ConfigurationType, V extends Configuration[T]>(key: T, value: V): void {
  if (!configKeys.includes(key)) {
    throw new ReferenceError(`Unable to set configuration for ${key} as it isn't a valid configuration key. Avaliable configuration keys to use are:\n${configKeys.join(', ')}\n`)
  }

  configuration[key] = value
}

/**
 * Stores our current Webpack configuration and environment variables.
 *
 * @param {webpack.ParserOptions} env Webpack environment configuration
 * @return {void}
 */
export function setupEnvironment(env: webpack.ParserOptions): void {
  environment = {
    ...env,

    mode    : env.dev === true ? 'development' : 'production',
    project : env.project,
  }

  // Ensure the project is valid
  if (!environment.project) {
    logger.error('Specify a project when running webpack eg --env.project="core"')
    process.exit(1)
  }
}

/**
 * Retrieve the project configuration.
 *
 * @return {Project}
 */
export function getProjectConfiguration(): Project {
  return projects[environment.project]
}

/**
 * Retrieve the project path for the given `path` key.
 *
 * @param {ConfigurationType} path Key of the path
 * @return {string}
 */
export function getProjectPath<T extends ConfigurationType>(path: T): string {
  return resolve(getConfiguration(path), environment.project)
}

/**
 * Retrieves the Maven configuration values we need.
 *
 * @return {MavenConfigMap}
 */
export function getMavenConfiguration(): MavenConfigMap {
  return {
    appsPath: getMavenConfigurationValueByPath<string>({
      parser : (value) => value[0],
      path   : 'package.appsPath',
      pom    : configuration[ConfigurationType.MAVEN_PROJECT],
    }),

    authorPort: getMavenConfigurationValueByPath<number>({
      parser : (value) => value[0],
      path   : 'crx.port',
      pom    : configuration[ConfigurationType.MAVEN_PARENT],
    }),

    sharedAppsPath: getMavenConfigurationValueByPath<string>({
      parser : (value) => value[0],
      path   : 'package.path.apps',
      pom    : configuration[ConfigurationType.MAVEN_PROJECT],
    }),
  }
}
