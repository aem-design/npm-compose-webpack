import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

import { DependencyType } from 'src/types/enums'

function constructCommand(dependencies: string[]): string {
  return ''
}

function executeCommand(): void {
  //
}

function usingYarn(): boolean {
  return existsSync(resolve(process.cwd(), 'yarn.lock'))
}

export function installDependencies(dependencies: string[], type: DependencyType): boolean {
  const missingDependencies = dependencies.filter((dependency) => {
    try {
      return require.resolve(dependency).length
    } catch (_) {
      return true
    }
  })

  // Only install this batch of dependencies if at least one is missing
  if (missingDependencies.length === 0) {
    return false
  }

  for (const dependency of missingDependencies) {
    //
  }

  return true
}
