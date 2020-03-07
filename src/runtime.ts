import { relative, resolve } from 'path'
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
  RuntimeConfiguration,
  RuntimePaths,
} from './types'

import {
  ConfigurationType,
  DependencyType,
  Hook,
  HookType,
  WebpackIgnoredProps
} from './types/enums'

import {
  WebpackConfiguration,
  WebpackParserOptions,
} from './types/webpack'

import {
  getConfiguration,
  getMavenConfiguration,
  getProjectPath,

  setConfiguration,
  setProjects,
  setupEnvironment,
} from './config'

import EntryConfiguration from './entry'

import FeatureMap from './features/map'

import {
  generateConfiguration,
  getIfUtilsInstance,
} from './support/helpers'

import { executeHook } from './hooks'

import css from './support/css'

function processFeatures({ environment, features, paths, webpackConfig }: {
  environment: Environment;
  features: string[];
  paths: RuntimePaths;
  webpackConfig: WebpackConfiguration;
}) {
  for (const feature of features) {
    try {
      const featureInstance = FeatureMap[feature]({
        general: environment,
        paths,
        webpack: webpackConfig,
      })

      console.log(featureInstance.getDependencyList(DependencyType.NON_DEV))
      console.log(featureInstance.getDependencyList(DependencyType.DEV))
    } catch (_) {
      // Nothing to do here...
    }
  }

  throw new Error('testing...')
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

    // Merge some internal/external configurations together
    // TODO: Move vue into dynamic config
    const assetFilter = ['fontawesome.*', 'vue'/* , ...(configurationForWebpack.assetFilter || [])*/]

    /**
     * Post-init (before) hooks
     */
    executeHook(Hook.POST_INIT, HookType.BEFORE, environmentConfiguration)

    // Webpack configuration
    const clientLibsPath     = getConfiguration(ConfigurationType.PATH_CLIENTLIBS)
    // const devServerProxyPort = _get(configurationForWebpack, 'server.proxyPort', authorPort)
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
    console.log(JSON.stringify(entry, null, 2))

    const config: RuntimeConfiguration = merge.smartStrategy({
      'module.rules' : 'append',
      'plugins'      : 'append',
    })({
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
        assetFilter       : (assetFilename) => !new RegExp(assetFilter.join('|')).test(assetFilename),
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

      // plugins: removeEmpty<webpack.Plugin>([
      //   ...plugins.ComposeDefaults(),
      // ]),

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
    }, configurationForWebpack as any) as RuntimeConfiguration

    /**
     * Detect opt-in features
     */
    if (configuration.features) {
      processFeatures({
        environment,
        features: configuration.features,
        paths,
        webpackConfig: configurationForWebpack,
      })
    }

    /**
     * Post-init (after) hooks
     */
    executeHook(Hook.POST_INIT, HookType.AFTER, environmentConfiguration)

    return config
  }
}
