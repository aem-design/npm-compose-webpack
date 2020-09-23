import { relative, resolve } from 'path'
import { codeFrameColumns } from '@babel/code-frame'
import chalk from 'chalk'
import figlet from 'figlet'
import _get from 'lodash/get'
import _has from 'lodash/has'
import rimraf from 'rimraf'

import {
  customizeArray,
  customizeObject,
  mergeWithCustomize,
} from 'webpack-merge'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

import { logger } from '@aem-design/compose-support'

import type {
  AEMEnvironment,
  ComposeConfiguration,
  RuntimeConfiguration,
} from './types'

import {
  ConfigurationType,
  Hook,
  HookType,
  WebpackIgnoredProps
} from './types/enums'

import type {
  WebpackConfiguration,
  WebpackParserOptions,
} from './types/webpack'

import {
  mergeStrategy,

  getConfiguration,
  getConfigurable,
  getMavenConfiguration,
  getProjectConfiguration,
  getProjectPath,

  setConfiguration,
  setProjects,
  setupEnvironment,
} from './config'

import EntryConfiguration from './entry'

import processFeatures from './features/process'

import { executeHook } from './hooks'

import * as plugins from './plugins'

import css from './support/css'

import {
  generateConfiguration,
  getIfUtilsInstance,
} from './support/helpers'

export default (
  configuration: ComposeConfiguration,
  webpackEnv: WebpackParserOptions
): () => RuntimeConfiguration => {
  const baseConfiguration = configuration.standard

  /**
   * Show the current version of the package to easier identification
   */
  console.log('compose-webpack: v%s\n', require('../package.json').version)

  /**
   * Support banner
   */
  if (_get(baseConfiguration, 'banner.disable', false) !== true && webpackEnv.prod !== true) {
    console.log('')
    console.log(figlet.textSync(
      _get(baseConfiguration, 'banner.text', 'AEM.Design'),
      _get(baseConfiguration, 'banner.font', '3D-ASCII') as figlet.Fonts,
    ))
  }

  /**
   * Pre-init (before) hooks
   */
  executeHook(Hook.PRE_INIT, HookType.BEFORE, webpackEnv)

  /**
   * Begin Webpack!!
   */
  return (): RuntimeConfiguration => {
    const environment = setupEnvironment({ ...webpackEnv }, configuration.cliFlags)

    /**
     * Pre-init (after) hooks
     */
    executeHook(Hook.PRE_INIT, HookType.AFTER, environment)

    const flagDev  = environment.dev === true
    const flagProd = environment.prod === true
    const flagHMR  = environment.watch === true
    const project  = environment.project

    /**
     * General output
     */
    logger.info('Starting up the webpack bundler...')
    logger.info('')

    /**
     * Ensure our Maven config values are valid before continuing on...
     */
    const { appsPath, authorPort, sharedAppsPath } = getMavenConfiguration()

    if (!(authorPort || appsPath || sharedAppsPath)) {
      throw new Error('Unable to continue due to missing or invalid Maven configuration values!')
    }

    /**
     * Define the configuration for AEM.
     */
    const aemConfiguration: AEMEnvironment<number> = {
      paths: {
        app    : appsPath,
        shared : sharedAppsPath,
      },

      port: environment.aem.port || authorPort,
    }

    /**
     * Set any user-defined projects.
     */
    setProjects(baseConfiguration.projects ?? null, baseConfiguration.mergeProjects)

    /**
     * Set the base path for the project in AEM
     */
    setConfiguration(
      ConfigurationType.PATH_PUBLIC_AEM,
      `/etc.clientlibs/${aemConfiguration.paths.app}/clientlibs/${project}`,
    )

    /**
     * Define the project paths
     */
    const paths = {
      aem: flagHMR ? '/' : getConfiguration(ConfigurationType.PATH_PUBLIC_AEM),
      out: flagHMR ? getConfiguration(ConfigurationType.PATH_PUBLIC_AEM).substr(1) : false,
      src: getConfiguration(ConfigurationType.PATH_SOURCE),

      project: {
        public : getProjectPath(ConfigurationType.PATH_PUBLIC),
        src    : getProjectPath(ConfigurationType.PATH_SOURCE),
      },
    }

    const environmentConfiguration = {
      ...environment,
      paths,
    }

    // Setup the webpack configuration
    const configurationForWebpack = generateConfiguration(
      configuration.webpack,
      environmentConfiguration,
    ) as WebpackConfiguration

    // Validate the given webpack configuration (if any) and detect anything marked as forbidden
    const forbiddenProps = Object.keys(WebpackIgnoredProps).filter((x) => !/\d+/.test(x))

    for (const prop of forbiddenProps) {
      if (_has(configurationForWebpack, prop) === true) {
        throw new Error(`Forbidden webpack property detected (${prop})`)
      }
    }

    /**
     * Output some debug information about our AEM configuration
     */
    logger.info(chalk.bold('AEM Configuration'))
    logger.info('-------------------')
    logger.info(chalk.bold('Author Port         :'), aemConfiguration.port)
    logger.info(chalk.bold('Apps Path           :'), aemConfiguration.paths.app)
    logger.info(chalk.bold('Shared Apps Path    :'), aemConfiguration.paths.shared)

    // Webpack configuration
    const entry = EntryConfiguration(flagHMR)
    const mode  = getIfUtilsInstance().ifDev('development', 'production')

    logger.info('')
    logger.info(chalk.bold('Webpack Configuration'))
    logger.info('---------------------')
    logger.info(chalk.bold('Compilation Mode    :'), mode)
    logger.info(chalk.bold('Project Name        :'), project)
    logger.info(chalk.bold('Hot Reloading?      :'), flagHMR ? 'yes' : 'no')
    logger.info(chalk.bold('Client Libary Path  :'), getConfiguration(ConfigurationType.PATH_PUBLIC_AEM))
    logger.info(chalk.bold('Public Path (AEM)   :'), paths.aem)
    logger.info(chalk.bold('Public Path         :'), paths.project.public)
    logger.info(chalk.bold('Source Path         :'), paths.project.src)
    logger.info('')
    logger.info(chalk.bold('Entry Configuration'))
    logger.info('-------------------')

    const entryConfig = JSON.stringify(entry, null, 2)

    const entryCodeFrame = codeFrameColumns(entryConfig, {
      end   : { column: 0, line: 0 },
      start : { column: 0, line: 0 },
    }, {
      highlightCode : true,
      linesBelow    : entryConfig.split('\n').length,
    })

    console.log()
    console.log(entryCodeFrame)
    console.log()
    logger.info('')

    /**
     * Post-init (before) hooks
     */
    executeHook(Hook.POST_INIT, HookType.BEFORE, environmentConfiguration, getProjectConfiguration())

    /**
     * Clean the public directory for the project first...
     */
    if (environment.clean === true) {
      logger.info('Cleaning public folder...')
      rimraf.sync(`public/${environment.project}/**/*`)
      logger.info(chalk.bold('Done!'))

      console.log()
    }

    let config: RuntimeConfiguration = mergeWithCustomize({
      customizeArray  : customizeArray(mergeStrategy),
      customizeObject : customizeObject(mergeStrategy),
    })({
      context: paths.src,
      devtool: getIfUtilsInstance().ifDev(flagHMR ? 'cheap-module-source-map' : 'eval-cheap-module-source-map'),
      entry,
      mode,

      output: {
        chunkFilename : `${paths.out as string || 'clientlibs-footer'}/resources/chunks/[name]${flagProd ? '.[contenthash:8]' : ''}.js`,
        filename      : `${paths.out as string || 'clientlibs-footer/js'}/[name].js`,
        path          : paths.project.public,
        publicPath    : `${flagHMR ? '' : paths.aem}/`,
      },

      performance: {
        assetFilter       : (assetFilename) => !new RegExp(getConfigurable('assetFilters').join('|')).test(assetFilename),
        hints             : getIfUtilsInstance().ifDev(false, 'warning'),
        maxAssetSize      : 300000,
        maxEntrypointSize : 300000,
      },

      module: {
        rules: [
          {
            include : [resolve(paths.project.src, 'scss')],
            test    : /\.scss$/,

            use: [
              flagHMR ? 'style-loader' : MiniCssExtractPlugin.loader,
              ...css(environmentConfiguration),
            ],
          },
          {
            exclude : /node_modules/,
            test    : /\.css$/,

            use: [
              MiniCssExtractPlugin.loader,
              ...css(environmentConfiguration),
            ],
          },
          {
            exclude : /node_modules/,
            loader  : 'babel-loader',
            test    : /\.js$/,
          },
          {
            loader : 'file-loader',
            test   : /\.(png|jpg|gif|eot|ttf|svg|woff|woff2)$/,

            options: {
              context  : `src/${environment.project}`,
              emitFile : flagDev,
              name     : '[path][name].[ext]',

              publicPath(_: any, resrc: string, context: string): string {
                return `${flagHMR ? '/' : '../'}${relative(context, resrc)}`
              },
            },
          },
        ],
      },

      optimization: {
        moduleIds: 'hashed',

        minimizer: [
          // @ts-expect-error 'webpack-dev-server' incorrectly taking over the exported 'Plugin' type
          new TerserPlugin({
            cache           : true,
            extractComments : false,
            sourceMap       : false,

            terserOptions: {
              ecma     : 2015,
              safari10 : true,

              compress: {
                drop_console  : true,
                drop_debugger : true,
              },

              format: {
                beautify: false,
                comments: false,
              },
            },
          }),

          // @ts-expect-error 'webpack-dev-server' incorrectly taking over the exported 'Plugin' type
          new OptimizeCSSAssetsPlugin({
            canPrint     : true,
            cssProcessor : require('cssnano'),

            cssProcessorPluginOptions: {
              preset: ['default', {
                discardComments: {
                  removeAll: true,
                },
              }],
            },
          }),
        ],

        splitChunks: {
          chunks: 'all',

          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      },

      plugins: plugins.ComposeDefaults(paths),

      resolve: {
        // Resolve modules from the child project too so we don't get errors complaining about missing
        // dependencies which aren't anything to do with our script.
        modules: [
          relative(__dirname, resolve(process.cwd(), 'node_modules')),
          'node_modules',
        ],
      },

      stats: {
        colors: getIfUtilsInstance().ifProd(false, true),
      },

      devServer: {
        contentBase : paths.project.public,
        host        : '0.0.0.0',
        open        : false,
        overlay     : true,
        port        : aemConfiguration.port + 2, // Default is '4502 + 2' = 4504

        proxy: [
          // Default AEM proxy
          {
            context : () => true,
            target  : `http://localhost:${aemConfiguration.port}`,
          },
        ],
      },
    }, configurationForWebpack) as RuntimeConfiguration

    /**
     * Detect opt-in features
     */
    if (configuration.features) {
      const featureConfig = processFeatures({
        environment,
        features: configuration.features,
        paths,
        webpackConfig: config,
      })

      if (featureConfig) {
        config = featureConfig
      }
    }

    /**
     * Set the resolve extensions
     */
    if (config.resolve) {
      config.resolve.extensions = getConfigurable('resolveExtensions')
    }

    /**
     * Post-init (after) hooks
     */
    executeHook(Hook.POST_INIT, HookType.AFTER, environmentConfiguration, getProjectConfiguration())

    return config
  }
}
