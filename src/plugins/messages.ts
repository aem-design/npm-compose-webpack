/* eslint-disable eslint-comments/no-unlimited-disable */

import chalk from 'chalk'
import webpack from 'webpack'
import format from 'webpack-format-messages'

import { logger } from '@aem-design/compose-support'

// Internal
const pluginName = 'compose-messages'

/**
 * All credit and inspiration goes to https://github.com/lukeed/webpack-messages
 */
export default class ComposeMessages implements webpack.Plugin {
  public apply(compiler: webpack.Compiler) {
    const onStart = () => {
      console.log()
      logger.info('Building...')
    }

    const onComplete = (stats: webpack.Stats) => {
      const messages = format(stats)

      if (messages.errors.length) {
        this.printError(chalk.red('Failed to compile!'), messages.errors)
        return
      }

      if (messages.warnings.length) {
        this.printError(chalk.yellow('Compiled with warnings.'), messages.warnings, true)
        return
      }

      if (stats.endTime && stats.startTime) {
        const compileTime = (stats.endTime - stats.startTime) / 1e3

        logger.info(chalk.green(`Completed in ${compileTime}s!`))
      }
    }

    // eslint-disable-next-line
    if (compiler.hooks !== void 0) {
      compiler.hooks.compile.tap(pluginName, onStart)
      compiler.hooks.invalid.tap(pluginName, () => onStart())
      compiler.hooks.done.tap(pluginName, onComplete)
    } else {
      compiler.plugin('compile', onStart)
      compiler.plugin('invalid', () => onStart())
      compiler.plugin('done', onComplete)
    }
  }

  private printError(message: string, errors: string[], warning = false) {
    const errorMessage = `${message}

    ${errors.join('')}`

    console.log('\n')

    if (warning) {
      logger.warning(errorMessage)
    } else {
      logger.error(errorMessage)
    }
  }
}
