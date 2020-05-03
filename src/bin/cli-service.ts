#!/usr/bin/env node

import { existsSync } from 'fs'
import { resolve } from 'path'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import createConfig from 'webpack-dev-server/lib/utils/createConfig'
import defaultPort from 'webpack-dev-server/lib/utils/defaultPort'
import yargs from 'yargs'

import runtime from '../runtime'

import {
  ComposeConfiguration,
} from '../types'

const args = yargs
  .alias('h', 'help')
  .alias('v', 'version')
  .option('aem.port', {
    default     : false,
    description : 'Specify a different author port.',
    type        : 'number',
  })
  .option('analyzer', {
    default     : false,
    description : 'Enable the Bundle Analyzer plugin?',
    type        : 'boolean',
  })
  .option('clean', {
    default     : true,
    description : 'Should the public directory for the specified project be cleaned?',
    type        : 'boolean',
  })
  .option('config', {
    default     : 'compose.config.js',
    description : 'Compose configuration file name',
  })
  .option('dev', {
    alias       : 'd',
    default     : false,
    description : 'Set the build mode to development',
    type        : 'boolean',
  })
  .option('eslint', {
    default     : true,
    description : 'Toggle ESLint validation via webpack',
    type        : 'boolean',
  })
  .option('maven', {
    default     : false,
    description : 'Was the task started from within Maven?',
    type        : 'boolean',
  })
  .option('prod', {
    alias       : 'p',
    default     : false,
    description : 'Set the build mode to production',
    type        : 'boolean',
  })
  .option('project', {
    description : 'Name of the project to build',
    required    : true,
    type        : 'string',
  })
  .option('stylelint', {
    default     : true,
    description : 'Toggle Stylelint validation via webpack',
    type        : 'boolean',
  })
  .option('watch', {
    default     : false,
    description : 'Use webpack-dev-server to proxy AEM and serve changes in real-time',
    type        : 'boolean',
  })
  .example('aemdesign-compose --project=core', 'Basic usage')
  .example('aemdesign-compose --config <file name>', 'Custom compose configuration file')
  .showHelpOnFail(true)
  .version()
  .wrap(130)
  .argv

/**
 * Is there a custom configuration file we can use?
 */
let composeConfiguration!: ComposeConfiguration

const configFilePath = resolve(process.cwd(), args.config)

if (existsSync(configFilePath)) {
  try {
    composeConfiguration = require(configFilePath) as ComposeConfiguration
  } catch (ex) {
    throw new Error(`Unable to load compose configuration file: ${(ex as Error).message}`)
  }
}

/**
 * Start your engines...
 */
const webpackConfiguration = runtime(composeConfiguration, args)()
const webpackInstance      = webpack(webpackConfiguration)

if (args.watch) {
  const devServer = new WebpackDevServer(
    webpackInstance,
    createConfig(webpackConfiguration, {
      ...args,

      // Set some defaults so we don't have to constantly pass them via CLI
      hot      : true,
      info     : true,
      progress : true,
    }, { port: defaultPort }),
  )

  devServer.listen(webpackConfiguration.devServer.port as number, (err) => {
    if (err) {
      throw err
    }
  })
} else {
  webpackInstance.run((err) => {
    if (err) {
      throw err
    }
  })
}
