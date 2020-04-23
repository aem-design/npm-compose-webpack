import { DependenciesMap } from '../../types'

import {
  InstallStatus,
} from '../../types/enums'

function installDependencies(dependenciesMap: DependenciesMap) {
  if (dependenciesMap.dev.includes('tsconfig-paths-webpack-plugin')) {
    // return InstallStatus.RESTART
  }

  return InstallStatus.SKIPPED
}

function resolveDependency(dependency: string) {
  return dependency
}

module.exports = {
  installDependencies,
  resolveDependency,
}
