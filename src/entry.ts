import webpack from 'webpack'

import * as Types from '../types/index'

import {
  environment,

  getProjectConfiguration,
} from './config'

function getHMRConfiguration(project: Types.Project): webpack.Entry {
  const mappedEntries = {
    footer: [],
    header: [],
  }

  const additionalEntries = project.additionalEntries
  const fileMap           = project.fileMap

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
      `./${environment.project}/js/${project.entryFile.js}`,
      `./${environment.project}/scss/${project.entryFile.sass}`,
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
    [project.outputName]: [
      `./${environment.project}/js/${project.entryFile.js}`,
      `./${environment.project}/scss/${project.entryFile.sass}`,
    ],

    ...project.additionalEntries,
  }
}
