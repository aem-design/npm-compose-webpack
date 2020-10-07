import path from 'path'

import { RuntimeConfiguration } from '@/types'

import runtime from '@/runtime'

interface Configuration {
  entryFile: string;
  outputName: string;
  project: string;
}

const fixturesPath = path.resolve(__dirname, '../fixtures')

export default ({
  entryFile,
  outputName,
  project,
}: Configuration): Required<RuntimeConfiguration> => runtime(
  {
    standard: {
      projects: {
        mock: {
          entryFile,
          outputName,
        },
      },
    },

    webpack: {
      context: fixturesPath,
    },
  },
  {
    aem: {
      port: false,
    },

    dev: true,
    project,
  },
)() as Required<RuntimeConfiguration>
