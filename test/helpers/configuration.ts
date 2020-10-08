import {
  ComposeConfiguration,
  RuntimeConfiguration,
} from '@/types'

import {
  WebpackParserOptions,
} from '@/types/webpack'

import runtime from '@/runtime'

export function composeConfiguration(config: Partial<ComposeConfiguration>): Partial<ComposeConfiguration> {
  return {
    standard: {
      mergeProjects: false,
    },

    webpack: {
      context: process.cwd(),
    },

    ...config,
  }
}

export default (
  configuration: Partial<ComposeConfiguration>,
  env: WebpackParserOptions,
): Required<RuntimeConfiguration> => runtime(
  configuration,
  {
    aem: {
      port: false,
    },

    clean : false,
    dev   : true,

    ...env,
  },
)() as Required<RuntimeConfiguration>
