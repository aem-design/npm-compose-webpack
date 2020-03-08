import { resolve } from 'path'
import webpack from 'webpack'

import {
  Configuration,
  Environment,
  MavenConfigMap,
  Project,
  ProjectsConfiguration,
} from './types'

import { ConfigurationType } from './types/enums'

import { getMavenConfigurationValueByPath } from './support/helpers'

import { defaultProjects } from './defaults'

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

let projects: ProjectsConfiguration = {}

/**
 * Environment configuration for Webpack.
 */
export let environment: Environment = {
  hmr     : false,
  mode    : 'development',
  project : '',
}

/**
 * Merge strategy for `webpack-merge`.
 */
export const mergeStrategy: Record<string, 'append' | 'prepend' | 'replace'> = {
  'module.rules' : 'append',
  'plugins'      : 'append',
}

/**
 * Sets the required projects map. If none are supplied, the default map will be used instead.
 */
export function setProjects(incomingProjects: ProjectsConfiguration | null = null) {
  if (!incomingProjects || Object.keys(incomingProjects).length === 0) {
    projects = defaultProjects
  } else {
    projects = incomingProjects
  }
}

/**
 * Retrieve a stored configuration value by the given `key`.
 */
export function getConfiguration<T extends ConfigurationType, R extends Configuration[T]>(key: T): R {
  if (!configKeys.includes(key)) {
    throw new ReferenceError(`Unable to get configuration for ${key} as it isn't a valid configuration key. Avaliable configuration keys to use are:\n${configKeys.join(', ')}\n`)
  }

  return configuration[key] as R
}

/**
 * Store a new `value` for the given `key`.
 */
export function setConfiguration<T extends ConfigurationType, V extends Configuration[T]>(key: T, value: V): void {
  if (!configKeys.includes(key)) {
    throw new ReferenceError(`Unable to set configuration for ${key} as it isn't a valid configuration key. Avaliable configuration keys to use are:\n${configKeys.join(', ')}\n`)
  }

  configuration[key] = value
}

/**
 * Stores our current Webpack configuration and environment variables.
 */
export function setupEnvironment(env: webpack.ParserOptions): Environment {
  environment = {
    ...env,

    hmr     : env.watch === true,
    mode    : env.dev === true ? 'development' : 'production',
    project : env.project,
  }

  // Ensure the project is valid
  if (!environment.project) {
    throw new Error('Specify a project when running webpack eg --env.project="core"')
  }

  return environment
}

/**
 * Retrieve the project configuration.
 */
export function getProjectConfiguration(): Project {
  return projects[environment.project]
}

/**
 * Retrieve the project path for the given `path` key.
 */
export function getProjectPath<T extends ConfigurationType>(path: T): string {
  return resolve(getConfiguration(path), environment.project)
}

/**
 * Retrieves the Maven configuration values we need.
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
