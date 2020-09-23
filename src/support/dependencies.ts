import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import _flatten from 'lodash/flatten'

import { logger } from '@aem-design/compose-support'

import type {
  DependenciesMap,
} from '../types'

import {
  DependencyType,
  InstallStatus,
} from '../types/enums'

// Internal
const isUsingYarn = existsSync(resolve(process.cwd(), 'yarn.lock'))

export function constructCommand(dependencies: string[], type: DependencyType): string {
  const isDev = type === DependencyType.DEV

  if (isUsingYarn) {
    return `yarn add ${dependencies.join(' ')}${isDev ? ' -D' : ''}`
  }

  return `npm install ${dependencies.join(' ')}${isDev ? ' --save-dev' : ''}`
}

export function executeInstallation(dependenciesMap: DependenciesMap): void {
  const dependencies    = dependenciesMap[DependencyType.NON_DEV]
  const devDependencies = dependenciesMap[DependencyType.DEV]

  if (devDependencies.length) {
    execSync(constructCommand(
      devDependencies,
      DependencyType.DEV,
    ))
  }

  if (dependencies.length) {
    execSync(constructCommand(
      dependencies,
      DependencyType.NON_DEV,
    ))
  }
}

export function resolveDependency(dependency: string, catchError = false, fallback = ''): string {
  if (catchError === true) {
    try {
      return require.resolve(dependency, { paths: [process.cwd()] })
    } catch (_) {
      return fallback
    }
  }

  return require.resolve(dependency, { paths: [process.cwd()] })
}

export function installDependencies(dependenciesMap: DependenciesMap): InstallStatus {
  const dependencyTypes = Object.keys(dependenciesMap)

  const missingDependencies =
    _flatten(dependencyTypes.map((type) => dependenciesMap[type] as string[]))
    .filter((dependency) => {
      const [moduleName] = dependency.split(/^(.*)@/).filter(x => x)

      try {
        return resolveDependency(moduleName).length === 0
      } catch (_) {
        return true
      }
    }
  )

  // Only install this batch of dependencies if at least one is missing
  if (missingDependencies.length === 0) {
    return InstallStatus.SKIPPED
  }

  console.log()
  logger.info('Getting ready to install...', chalk.italic(missingDependencies.join(', ')))

  executeInstallation(dependenciesMap)

  return InstallStatus.RESTART
}
