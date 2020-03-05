import chalk from 'chalk'
import figlet from 'figlet'
import _get from 'lodash/get'
import { relative, resolve } from 'path'
import webpack from 'webpack'
import { removeEmpty } from 'webpack-config-utils'

import ExtractCssChunks from 'extract-css-chunks-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

import { logger } from '@aem-design/compose-support'

import {
  ComposeConfiguration,
  ComposeWebpackConfiguration,
  WebpackConfiguration,
} from './types'

import { ConfigurationType } from './enum'

import {
  getConfiguration,
  getMavenConfiguration,
  getProjectPath,

  setConfiguration,
  setProjects,
  setupEnvironment,
} from './config'

import EntryConfiguration from './entry'

import {
  generateConfiguration,
  getIfUtilsInstance,
} from './helpers'

import * as loaders from './loaders'
import * as plugins from './plugins'

export default (runtimeConfiguration: ComposeConfiguration) => {
  const baseConfiguration = generateConfiguration(runtimeConfiguration.standard)

  /**
   * Support banner
   */
  if (_get(baseConfiguration, 'banner.disable', true) !== false) {
    console.log('')
    console.log(figlet.textSync(
      _get(baseConfiguration, 'banner.text', 'AEM.Design'),
      _get(baseConfiguration, 'banner.font', '3D-ASCII') as figlet.Fonts,
    ))
  }

  /**
   * Begin Webpack!!
   */
  return (webpackEnv: webpack.ParserOptions): ComposeWebpackConfiguration => {
    const environment = setupEnvironment({
      ...webpackEnv,
    })

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
      logger.error('Unable to continue due to missing or invalid Maven configuration values!')
      process.exit(1)
    }

    /**
     * Set any user-defined projects.
     */
    setProjects(baseConfiguration.projects || null)

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

    // Setup the webpack configuration
    const webpackConfiguration = generateConfiguration(runtimeConfiguration.webpack, {
      ...environment,
      paths,
    }) as WebpackConfiguration

    // Webpack configuration
    const clientLibsPath     = getConfiguration(ConfigurationType.PATH_CLIENTLIBS)
    const devServerProxyPort = _get(webpackConfiguration, 'server.proxyPort', authorPort)
    const entry              = EntryConfiguration(flagHMR)
    const mode               = getIfUtilsInstance().ifDev('development', 'production')

    logger.info(chalk.bold('Webpack Configuration'))
    logger.info('---------------------')
    logger.info(chalk.bold('Compilation Mode    :'), mode)
    logger.info(chalk.bold('Project Name        :'), project)
    logger.info(chalk.bold('Hot Reloading?      :'), environment.hmr ? 'yes' : 'no')
    logger.info(chalk.bold('Client Libary Path  :'), clientLibsPath)
    logger.info(chalk.bold('Public Path         :'), paths.project.public)
    logger.info(chalk.bold('Public Path (AEM)   :'), paths.aem)
    logger.info(chalk.bold('Source Path         :'), paths.project.src)
    logger.info('')
    logger.info(chalk.bold('Entry Configuration'))
    logger.info('-------------------')
    console.log(JSON.stringify(entry, null, 2))

    return {
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
        assetFilter(assetFilename) {
          return !/fontawesome.*|vue/.test(assetFilename)
        },

        hints             : getIfUtilsInstance().ifDev(false, 'error'),
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
              ...loaders.css(webpackEnv),
            ],
          },
          {
            include : [resolve(paths.project.src, 'js/components')],
            test    : /\.scss$/,

            use: [
              {
                loader: 'vue-style-loader',

                options: {
                  hmr       : flagHMR,
                  sourceMap : true,
                },
              },
              ...loaders.css(environment, {
                sass: {
                  loader: {
                    prependData: `@import 'setup';`,
                  },

                  options: {
                    includePaths : [resolve(paths.project.src, 'scss')],
                  },
                },
              }),
            ],
          },
          {
            loader : 'file-loader',
            test   : /\.(png|jpg|gif|eot|ttf|svg|woff|woff2)$/,

            options: {
              context  : `src/${environment.project}`,
              emitFile : flagDev,
              name     : '[path][name].[ext]',

              publicPath(url: string, resrc: string, context: string): string {
                return `${flagHMR ? '/' : '../'}${relative(context, resrc)}`
              },
            },
          },
          {
            test: require.resolve('jquery', {
              paths: [resolve(process.cwd(), 'node_modules')],
            }),

            use: [
              {
                loader  : 'expose-loader',
                options : 'jQuery',
              },
              {
                loader  : 'expose-loader',
                options : '$',
              },
            ],
          },

          // Default JS loaders
          ...loaders.js(),

          // Any additional rules that the child projects needs
          ..._get(webpackConfiguration, 'rules', []),
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

            jquery: flagHMR ? false : {
              // @ts-ignore
              filename: 'clientlibs-header/js/vendorlib/jquery.js',
              // @ts-check

              name : 'jquery',
              test : /[\\/]node_modules[\\/](jquery)[\\/]/,
            },

            vue: {
              name: 'vue',
              test: /[\\/]node_modules[\\/](vue|vue-property-decorator)[\\/]/,
            },

            ..._get(webpackConfiguration, 'cacheGroups', {}),
          },
        },
      },

      plugins: removeEmpty<webpack.Plugin>([
        // Default plugins that are required
        ...plugins.ComposeDefaults(),

        // Any additional plugins that the child projects needs
        ..._get(webpackConfiguration, 'plugins', []),
      ]),

      resolve: {
        alias: {
          vue$: flagDev ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.min.js',
        },

        extensions: ['.ts', '.tsx', '.js'],

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
        host        : _get(webpackConfiguration, 'server.host', '0.0.0.0'),
        open        : false,
        overlay     : true,
        port        : parseInt(_get(webpackConfiguration, 'server.port', 4504), 10),

        proxy: [
          // Additional proxy paths need to be loaded first since they will bind from the same host which uses
          // root context by default. This means the default proxy below is the boss when it comes to requests.
          ..._get(webpackConfiguration, 'server.proxies', []),

          // Default AEM proxy
          {
            context : () => true,
            target  : `http://${_get(webpackConfiguration, 'server.proxyHost', 'localhost')}:${devServerProxyPort}`,
          },
        ],
      },
    }
  }
}
