#!/usr/bin/env node

import { resolve } from 'path'
import webpack from 'webpack'
import webpackDevServer from 'webpack-dev-server'
import yargs from 'yargs'

import { logger } from '@aem-design/compose-support'

import Compose from '../index'

const args = yargs
  .alias('h', 'help')
  .alias('v', 'version')
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
    default     : true,
    description : 'Set the build mode to development',
    type        : 'boolean',
  })
  .option('maven', {
    default     : false,
    description : 'Was the task started from within Maven?',
    type        : 'boolean',
  })
  .option('prod', {
    default     : false,
    description : 'Set the build mode to production',
    type        : 'boolean',
  })
  .option('project', {
    default     : '',
    description : 'Name of the project to build',
    required    : true,
    type        : 'string',
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

let composeConfiguration = {}

try {
  // tslint:disable-next-line
  composeConfiguration = require(resolve(process.cwd(), args.config))
} catch (_) {
  logger.warning('Unable to find compose configuration file')
}

/**
 * Start your engines...
 */

const webpackConfiguration = Compose({}, composeConfiguration)(args)
const webpackInstance      = webpack(webpackConfiguration)

if (args.watch && webpackConfiguration.devServer) {
  const devServer = new webpackDevServer(webpackInstance, {})

  devServer.listen(webpackConfiguration.devServer.port as number, (err) => {
    if (err) {
      logger.error(err)
      process.exit(1)
    }

    logger.info('Webpack Dev Server started...')
  })
} else {
  webpackInstance.run((err, stats) => {
    if (err) {
      throw err
    }

    process.stdout.write(stats.toString({
      children     : false,
      chunkModules : false,
      chunks       : false,
      colors       : true,
      modules      : false,
    }) + '\n\n')
  })
}
