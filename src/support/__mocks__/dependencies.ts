import type {
  DependenciesMap,
} from '../../types'

import {
  InstallStatus,
} from '../../types/enums'

export function installDependencies(dependenciesMap: DependenciesMap): InstallStatus {
  if (dependenciesMap.dev.includes('tsconfig-paths-webpack-plugin')) {
    return InstallStatus.RESTART
  }

  return InstallStatus.SKIPPED
}

export function resolveDependency(dependency: string): string {
  return dependency
}
