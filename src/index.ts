import {
  configurationProxy as configuration,
  getMavenConfigurationValueByPath as getMavenValueByPath,
  getIfUtilsInstance as ifUtil,
} from './helpers'

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
  support,
}
