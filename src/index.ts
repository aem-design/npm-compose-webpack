import {
  getWebpackCompiler,
} from './support/compiler'

import {
  configurationProxy as configuration,
  getMavenConfigurationValueByPath as getMavenValueByPath,
  getIfUtilsInstance as ifUtil,
} from './support/helpers'

import { registerHook } from './hooks'

import css from './support/css'

const support = {
  loaders: {
    css,
  },
}

export {
  configuration,
  getMavenValueByPath,
  getWebpackCompiler,
  ifUtil,
  registerHook,
  support,
}
