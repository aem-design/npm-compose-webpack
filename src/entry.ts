import { resolve } from 'path'
import _get from 'lodash/get'
import webpack from 'webpack'

import type {
  Project,
} from './types'

import {
  environment,

  getProjectConfiguration,
} from './config'

function getHMRConfiguration(project: Project): webpack.Entry {
  const mappedEntries: {
    [key: string]: string[];
  } = {
    footer: [],
    header: [],
  }

  const additionalEntries = project.additionalEntries

  const fileMap: typeof mappedEntries = {
    header: _get(project, 'fileMap.header', []) as string[],
    footer: _get(project, 'fileMap.footer', []) as string[],
  }

  if (additionalEntries && fileMap) {
    for (const key of Object.keys(mappedEntries)) {
      const additionalEntryKeys = Object.keys(additionalEntries)
        .filter((x) => fileMap[key].includes(x))

      for (const entryKey of additionalEntryKeys) {
        mappedEntries[key] = [
          ...mappedEntries[key],
          ...additionalEntries[entryKey],
        ]
      }
    }
  }

  return {
    'clientlibs-footer': [
      `./${environment.project}/js/${project.entryFile}`,
      ...mappedEntries.footer,
    ],

    'clientlibs-header': [
      resolve(__dirname, '../support/empty.css'),
      ...mappedEntries.header,
    ],
  }
}

export default (flagHMR: boolean): webpack.Entry => {
  const project = getProjectConfiguration()

  if (flagHMR) {
    return getHMRConfiguration(project)
  }

  let entries = {
    [project.outputName]: `./${environment.project}/js/${project.entryFile}`,
  }

  if (project.additionalEntries) {
    entries = {
      ...entries,
      ...project.additionalEntries,
    }
  }

  return entries
}
