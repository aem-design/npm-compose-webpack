import { relative, resolve } from 'path'
import { codeFrameColumns } from '@babel/code-frame'
import chalk from 'chalk'
import figlet from 'figlet'
import _get from 'lodash/get'
import _has from 'lodash/has'
import merge from 'webpack-merge'

import ExtractCssChunks from 'extract-css-chunks-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

import { logger } from '@aem-design/compose-support'

import {
  ComposeConfiguration,
  Environment,
  FeatureList,
  RuntimeConfiguration,
  RuntimePaths,
} from './types'

import {
  ConfigurationType,
  Hook,
  HookType,
  InstallStatus,
  WebpackIgnoredProps
} from './types/enums'

import {
  WebpackConfiguration,
  WebpackParserOptions,
} from './types/webpack'

import {
  mergeStrategy,

  getConfiguration,
  getMavenConfiguration,
  getProjectPath,

  setConfiguration,
  setProjects,
  setupEnvironment,
} from './config'

import EntryConfiguration from './entry'

import FeatureMap from './features/map'

import { executeHook } from './hooks'

import * as plugins from './plugins'

import css from './support/css'
import installDependencies from './support/dependencies'

import {
  exit,
  generateConfiguration,
  getIfUtilsInstance,
} from './support/helpers'

// Internal
// TODO: Move into the global configuration
const assetFilters = ['fontawesome.*']

/**
 * Process the incoming features and install any dependencies they require. Dependencies are
 * using either NPM or Yarn depending which type of lock file exists.
 */
function processFeatures({ environment, features, paths, webpackConfig }: {
  environment: Environment;
  features: FeatureList;
  paths: RuntimePaths;
  webpackConfig: RuntimeConfiguration;
}): RuntimeConfiguration {
  let status!: InstallStatus
  let updatedConfig = webpackConfig

  for (const feature of features) {
    try {
      const featureInstance = FeatureMap[feature]({
        general: environment,
        paths,
        webpack: webpackConfig,
      })

      status = status === InstallStatus.RESTART
        ? status
        : installDependencies(feature, featureInstance.getFeatureDependencies())

      assetFilters.push(...featureInstance.getFeatureAssetFilters())

      updatedConfig = featureInstance.defineWebpackConfiguration(webpackConfig)
    } catch (ex) {
      console.log()
      logger.error('Failed to install dependencies:', ex.message)

      // TODO: Use exit(1) instead once TypeScript is implemented
      // exit(1)
    }
  }

  if (status === InstallStatus.RESTART) {
    console.log()
    logger.info('It appears some dependencies were just installed, please re-run the same command again to continue!')

    exit(0)
  }

  return updatedConfig
}

export default (configuration: ComposeConfiguration, webpackEnv: WebpackParserOptions) => {
  const baseConfiguration = configuration.standard

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
    const environment = setupEnvironment({
      ...webpackEnv,
    })

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
     * Set any user-defined projects.
     */
    setProjects(baseConfiguration.projects ?? null)

    logger.info(chalk.bold('Maven configuration'))
    logger.info('-------------------')
    logger.info(chalk.bold('Author Port         :'), authorPort)
    logger.info(chalk.bold('Apps Path           :'), appsPath)
    logger.info(chalk.bold('Shared Apps Path    :'), sharedAppsPath)
    logger.info('')

    if (!flagHMR) {
      setConfiguration(
        ConfigurationType.PATH_CLIENTLIBS,
        `${sharedAppsPath}/${appsPath}/clientlibs/${project}/`,
      )

      setConfiguration(
        ConfigurationType.PATH_PUBLIC_AEM,
        `/etc.clientlibs/${appsPath}/clientlibs/${project}/`,
      )
    }

    // Define the project paths
    const paths = {
      aem: getConfiguration(ConfigurationType.PATH_PUBLIC_AEM),
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

    const nodeModulesChildPath   = resolve(process.cwd(), 'node_modules')
    const nodeModulesCurrentPath = resolve(__dirname, '../../', 'node_modules')

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
     * Post-init (before) hooks
     */
    executeHook(Hook.POST_INIT, HookType.BEFORE, environmentConfiguration)

    // Webpack configuration
    const clientLibsPath     = getConfiguration(ConfigurationType.PATH_CLIENTLIBS)
    const entry              = EntryConfiguration(flagHMR)
    const mode               = getIfUtilsInstance().ifDev('development', 'production')

    logger.info(chalk.bold('Webpack Configuration'))
    logger.info('---------------------')
    logger.info(chalk.bold('Compilation Mode    :'), mode)
    logger.info(chalk.bold('Project Name        :'), project)
    logger.info(chalk.bold('Hot Reloading?      :'), flagHMR ? 'yes' : 'no')
    logger.info(chalk.bold('Client Libary Path  :'), clientLibsPath)
    logger.info(chalk.bold('Public Path         :'), paths.project.public)
    logger.info(chalk.bold('Public Path (AEM)   :'), paths.aem)
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

    const config: RuntimeConfiguration = merge.smartStrategy(mergeStrategy)({
      context: paths.src,
      devtool: getIfUtilsInstance().ifDev(flagHMR ? 'cheap-module-source-map' : 'cheap-module-eval-source-map'),
      entry,
      mode,

      output: {
        chunkFilename : `clientlibs-footer/resources/chunks/[name]${flagProd ? '.[contenthash:8]' : ''}.js`,
        filename      : 'clientlibs-footer/js/[name].js',
        path          : paths.project.public,
        publicPath    : paths.aem,
      },

      performance: {
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
              flagHMR ? 'style-loader' : { loader: ExtractCssChunks.loader },
              ...css(webpackEnv),
            ],
          },
          {
            exclude : [nodeModulesChildPath, nodeModulesCurrentPath],
            test    : /\.[jt]sx?$/,

            use: [
              {
                loader: 'babel-loader',
              },
              // TODO: Add opt-in for TypeScript
              {
                loader: 'ts-loader',

                options: {
                  configFile: resolve(process.cwd(), 'tsconfig.json'),
                },
              },
            ],
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
        minimizer: [
          new TerserPlugin({
            cache           : true,
            extractComments : false,
            sourceMap       : false,

            terserOptions: {
              ecma     : 6,
              safari10 : true,
              warnings : false,

              compress: {
                drop_console: true,
              },

              output: {
                beautify: false,
                comments: false,
              },
            },
          }),

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

            vue: {
              name: 'vue',
              test: /[\\/]node_modules[\\/](vue|vue-property-decorator)[\\/]/,
            },
          },
        },
      },

      plugins: plugins.ComposeDefaults(),

      resolve: {
        alias: {
          // TODO: Put aliases here...
        },

        extensions: ['.ts', '.js'],

        // Resolve modules from the child project too so we don't get errors complaining about missing
        // dependencies which aren't anything to do with our script.
        modules: [
          relative(__dirname, resolve(process.cwd(), 'node_modules')),
          'node_modules',
        ],

        plugins: [
          new TsconfigPathsPlugin(),
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
        port        : 4504,

        proxy: [
          // Additional proxy paths need to be loaded first since they will bind from the same host which uses
          // root context by default. This means the default proxy below is the boss when it comes to requests.
          // TODO: Build helper to inject custom proxy maps
          // ..._get(configurationForWebpack, 'server.proxies', []),

          // Default AEM proxy
          // TODO: Make this configurable
          {
            context : () => true,
            target  : `http://localhost:${authorPort}`,
          },
        ],
      },
    } as RuntimeConfiguration, configurationForWebpack)

    /**
     * Detect opt-in features
     */
    if (configuration.features) {
      processFeatures({
        environment,
        features: configuration.features,
        paths,
        webpackConfig: config,
      })
    }

    // Generate the asset filters
    if (config.performance) {
      const filters = assetFilters.join('|')

      config.performance.assetFilter = (assetFilename) => !new RegExp(filters).test(assetFilename)
    }

    /**
     * Post-init (after) hooks
     */
    executeHook(Hook.POST_INIT, HookType.AFTER, environmentConfiguration)

    return config
  }
}
