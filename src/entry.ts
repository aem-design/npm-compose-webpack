import _get from 'lodash/get'
import webpack from 'webpack'

import { Project } from './types'

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
    footer: [..._get(project, 'fileMap.footer', [])],
    header: [..._get(project, 'fileMap.header', [])],
  }

  if (additionalEntries && fileMap) {
    for (const key of Object.keys(mappedEntries)) {
      const additionalEntryKeys = Object.keys(additionalEntries)
        .filter((x) => fileMap[key].indexOf(x) !== -1)

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
      './hmr/empty.css',
      ...mappedEntries.header,
    ],
  }
}

export default (flagHMR: boolean): webpack.Entry => {
  const project = getProjectConfiguration()

  if (flagHMR) {
    return getHMRConfiguration(project)
  }

  return {
    [project.outputName]: `./${environment.project}/js/${project.entryFile}`,

    ...project.additionalEntries,
  }
}
