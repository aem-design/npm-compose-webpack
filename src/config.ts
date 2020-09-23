import { resolve } from 'path'
import _get from 'lodash/get'
import _has from 'lodash/has'
import _isEmpty from 'lodash/isEmpty'
import _mergeWith from 'lodash/mergeWith'
import _omitBy from 'lodash/omitBy'
import _set from 'lodash/set'
import webpack from 'webpack'
import { CustomizeRule } from 'webpack-merge/dist/types'

import type {
  CommandLineFlags,
  Configuration,
  Environment,
  MavenConfigMap,
  Project,
  ProjectsConfiguration,
} from './types'

import {
  ConfigurationType,
} from './types/enums'

import type {
  WebpackConfigurables,
} from './types/webpack'

import {
  getMavenConfigurationValueByPath,
} from './support/helpers'

import {
  defaultProjects,
} from './defaults'

// Internal
const workingDirectory = process.cwd()

const configurationDefaults: Configuration = {
  [ConfigurationType.MAVEN_PARENT]    : resolve(workingDirectory, '../pom.xml'),
  [ConfigurationType.MAVEN_PROJECT]   : resolve(workingDirectory, './pom.xml'),
  [ConfigurationType.PATH_PUBLIC]     : resolve(workingDirectory, 'public'),
  [ConfigurationType.PATH_PUBLIC_AEM] : '/',
  [ConfigurationType.PATH_SOURCE]     : resolve(workingDirectory, 'src'),
}

const configuration: Configuration = {
  ...configurationDefaults,
}

const configKeys = Object.values(ConfigurationType)

const webpackConfigurables: WebpackConfigurables = {
  assetFilters      : ['fontawesome.*'],
  resolveExtensions : ['.js'],
}

let projects: ProjectsConfiguration = {}

/**
 * Environment configuration for Webpack.
 */
export let environment: Environment = {
  aem: {
    paths: {
      app    : '',
      shared : '',
    },

    port: false,
  },

  analyzer  : false,
  clean     : false,
  eslint    : true,
  hmr       : false,
  maven     : false,
  mode      : 'development',
  project   : '',
  stylelint : true,
  watch     : false,
}

/**
 * Merge strategy for `webpack-merge`.
 */
export const mergeStrategy: { [key: string]: CustomizeRule } = {
  'devServer.proxy' : CustomizeRule.Prepend,
  'module.rules'    : CustomizeRule.Append,
  'plugins'         : CustomizeRule.Append,
}

/**
 * Merge a default and overriden project together.
 */
function projectsCustomiser(defaultProject: Project, overridenProject: Project): Project {
  const defaultProjectKeys   = Object.keys(defaultProject)
  const overridenProjectKeys = Object.keys(overridenProject)

  const defaultAdditionalEntries    = defaultProject.additionalEntries ?? {}
  const overriddenAdditionalEntries = overridenProject.additionalEntries ?? {}

  return {
    entryFile  : overridenProject.entryFile ?? defaultProject.entryFile,
    outputName : overridenProject.outputName ?? defaultProject.outputName,

    additionalEntries: {
      ...Object.keys(overriddenAdditionalEntries).reduce((acc, key) => {
        acc[key] = defaultAdditionalEntries[key]
          ? [...defaultAdditionalEntries[key], ...overriddenAdditionalEntries[key]]
          : overriddenAdditionalEntries[key]

        return acc
      }, defaultAdditionalEntries)
    },

    fileMap: _omitBy({
      footer: [...(defaultProject.fileMap?.footer ?? []), ...(overridenProject.fileMap?.footer ?? [])],
      header: [...(defaultProject.fileMap?.header ?? []), ...(overridenProject.fileMap?.header ?? [])],
    }, _isEmpty),

    // Merge in anything else that doesn't match a known key
    ...overridenProjectKeys.reduce((acc, key) => {
      if (!defaultProjectKeys.includes(key)) {
        acc[key] = overridenProject[key]
      }

      return acc
    }, {})
  }
}

/**
 * Sets the required projects map. If none are supplied, the default map will be used instead.
 */
export function setProjects(incomingProjects: ProjectsConfiguration | null = null, merge = false): void {
  const validProjectsConfig    = incomingProjects && Object.keys(incomingProjects).length
  const shouldMergeWithDefault = merge && validProjectsConfig !== null && validProjectsConfig > 0

  if (shouldMergeWithDefault || !validProjectsConfig) {
    projects = shouldMergeWithDefault
      ? _mergeWith(defaultProjects, incomingProjects, projectsCustomiser)
      : defaultProjects
  } else if (incomingProjects) {
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
export function setupEnvironment(env: webpack.ParserOptions, flags: CommandLineFlags = {}): Environment {
  environment = {
    ...env,

    eslint    : flags.eslint ?? (env.eslint || false),
    hmr       : env.watch === true,
    mode      : env.dev   === true ? 'development' : 'production',
    project   : env.project as string,
    stylelint : flags.stylelint ?? (env.stylelint || false),
  } as Environment

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
      path : 'package.appsPath',
      pom  : configuration[ConfigurationType.MAVEN_PROJECT],
    }),

    authorPort: getMavenConfigurationValueByPath<number>({
      parser : (value) => parseInt(value[0], 10),
      path   : 'crx.port',
    }),

    sharedAppsPath: getMavenConfigurationValueByPath<string>({
      path : 'package.path.apps',
      pom  : configuration[ConfigurationType.MAVEN_PROJECT],
    }),
  }
}

/**
 * Assigns the `value` to the `key` given. Built-in checks enable merging for some obejct
 * types, otherwise `value` overrides the previous value set.
 */
export function setConfigurable<T extends keyof WebpackConfigurables, R extends WebpackConfigurables[T]>(key: T, value: R): void {
  if (!_has(webpackConfigurables, key)) {
    throw new Error(`Unable to update webpack configurable for ${key} as it is invalid!`)
  }

  let newValue = _get(webpackConfigurables, key)

  if (Array.isArray(value)) {
    newValue = [...newValue, ...value]
  } else {
    newValue = value
  }

  _set(webpackConfigurables, key, newValue)
}

/**
 * Retrieve the stored value by the `key` given.
 */
export function getConfigurable<T extends keyof WebpackConfigurables, R extends WebpackConfigurables[T]>(key: T): R {
  if (!_has(webpackConfigurables, key)) {
    throw new Error(`Unable to get webpack configurable for ${key} as it is invalid!`)
  }

  return _get(webpackConfigurables, key) as R
}
