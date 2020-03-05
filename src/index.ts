import {
  configurationProxy as configuration,
  getMavenConfigurationValueByPath as getMavenValueByPath,
  getIfUtilsInstance as ifUtil,
} from './helpers'

import { registerHook } from './hooks'

import {
  css,
} from './loaders'

const support = {
  loaders: {
    css,
  },
}

export {
  configuration,
  getMavenValueByPath,
  ifUtil,
  registerHook,
  support,
}
