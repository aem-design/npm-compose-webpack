import chalk from 'chalk'
import figlet from 'figlet'
import _get from 'lodash/get'
import { relative, resolve } from 'path'
import webpack from 'webpack'
import { removeEmpty } from 'webpack-config-utils'
import webpackDevServer from 'webpack-dev-server'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

import { logger } from '@aem-design/compose-support'

import * as Types from './types'

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

import { getIfUtilsInstance } from './helpers'

import loaders from './loaders'
import plugins from './plugins'

export default (configuration: Types.WebpackConfiguration = {}) => {
  /**
   * Support banner
   */
  if (_get(configuration, 'banner.disable', true) !== false) {
    console.log('')
    console.log(figlet.textSync(
      _get(configuration, 'banner.text', 'AEM.Design'),
      _get(configuration, 'banner.font', '3D-ASCII') as figlet.Fonts,
    ))
  }

  /**
   * Begin Webpack!!
   */
  return (webpackEnv: webpack.ParserOptions): webpack.Configuration & {
    devServer: webpackDevServer.Configuration;
  } => {
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
    setProjects(configuration.projects || null)

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

    // Webpack configuration
    const clientLibsPath     = getConfiguration(ConfigurationType.PATH_CLIENTLIBS)
    const devServerProxyPort = _get(configuration, 'webpack.server.proxyPort', authorPort)
    const entry              = EntryConfiguration(flagHMR)
    const mode               = getIfUtilsInstance().ifDev('development', 'production')
    const projectPathPublic  = getProjectPath(ConfigurationType.PATH_PUBLIC)
    const projectPathSource  = getProjectPath(ConfigurationType.PATH_SOURCE)
    const publicPathAEM      = getConfiguration(ConfigurationType.PATH_PUBLIC_AEM)
    const sourcePath         = getConfiguration(ConfigurationType.PATH_SOURCE)

    logger.info(chalk.bold('Webpack Configuration'))
    logger.info('---------------------')
    logger.info(chalk.bold('Compilation Mode    :'), mode)
    logger.info(chalk.bold('Project Name        :'), project)
    logger.info(chalk.bold('Hot Reloading?      :'), environment.hmr ? 'yes' : 'no')
    logger.info(chalk.bold('Client Libary Path  :'), clientLibsPath)
    logger.info(chalk.bold('Public Path         :'), projectPathPublic)
    logger.info(chalk.bold('Public Path (AEM)   :'), publicPathAEM)
    logger.info(chalk.bold('Source Path         :'), projectPathSource)
    logger.info('')
    logger.info(chalk.bold('Entry Configuration'))
    logger.info('-------------------')
    console.log(JSON.stringify(entry, null, 2))

    return {
      context: sourcePath,
      devtool: getIfUtilsInstance().ifDev(flagHMR ? 'cheap-module-source-map' : 'cheap-module-eval-source-map'),
      entry,
      mode,

      output: {
        chunkFilename : `${clientLibsPath || ''}clientlibs-footer/resources/chunks/[name]${flagProd ? '.[contenthash:8]' : ''}.js`,
        filename      : `${clientLibsPath || ''}clientlibs-footer/js/[name].js`,
        path          : projectPathPublic,
        publicPath    : publicPathAEM,
      },

      performance: {
        assetFilter(assetFilename) {
          return !/fontawesome-brands|vue/.test(assetFilename)
        },

        hints             : getIfUtilsInstance().ifDev(false, 'error'),
        maxAssetSize      : 300000,
        maxEntrypointSize : 300000,
      },

      module: {
        rules: [
          {
            include : [resolve(projectPathSource, 'scss')],
            test    : /\.scss$/,

            use: [
              flagHMR ? {
                loader: 'style-loader',
              } : { loader: MiniCssExtractPlugin.loader },
              ...loaders.css(webpackEnv),
            ],
          },
          {
            include : [resolve(projectPathSource, 'js/components')],
            test    : /\.scss$/,

            use: [
              {
                loader: 'vue-style-loader',

                options: {
                  hmr       : flagHMR,
                  sourceMap : true,
                },
              },
              ...loaders.css({
                sassOptions: {
                  data         : `@import 'setup';`,
                  includePaths : [resolve(projectPathSource, 'scss')],
                },
              }),
            ],
          },
          {
            test: /\.css$/,

            use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },
              ...loaders.css(webpackEnv),
            ],
          },
          {
            loader : 'file-loader',
            test   : /\.(png|jpg|gif|eot|ttf|svg|woff|woff2)$/,

            options: {
              context  : `src/${environment.project}`,
              emitFile : flagDev,
              name     : '[path][name].[ext]',

              publicPath(url: string, resourcePath: string, context: string): string {
                return `${flagHMR ? '/' : '../'}${relative(context, resourcePath)}`
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
          ..._get(configuration, 'webpack.rules', []),
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
              filename: `${clientLibsPath || ''}clientlibs-header/js/vendorlib/jquery.js`,
              // @ts-check

              name : 'jquery',
              test : /[\\/]node_modules[\\/](jquery)[\\/]/,
            },

            vue: {
              name: 'vue',
              test: /[\\/]node_modules[\\/](vue|vue-property-decorator)[\\/]/,
            },

            ..._get(configuration, 'webpack.cacheGroups', {}),
          },
        },
      },

      plugins: removeEmpty<webpack.Plugin>([
        // Custom messages
        environment.watch !== true ? new plugins.ComposeMessages() : undefined,

        // Default plugins that are required
        ...plugins.ComposeDefaults(),

        // Any additional plugins that the child projects needs
        ..._get(configuration, 'webpack.plugins', []),
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
        colors: getIfUtilsInstance().ifDev(true, false),
      },

      devServer: {
        contentBase : projectPathPublic,
        host        : _get(configuration, 'webpack.server.host', '0.0.0.0'),
        open        : false,
        overlay     : true,
        port        : parseInt(_get(configuration, 'webpack.server.port', 4504), 10),

        proxy: [
          // Additional proxy paths need to be loaded first since they will bind from the same host which uses
          // root context by default. This means the default proxy below is the boss when it comes to requests.
          ..._get(configuration, 'webpack.server.proxies', []),

          // Default AEM proxy
          {
            context : () => true,
            target  : `http://${_get(configuration, 'webpack.server.proxyHost', 'localhost')}:${devServerProxyPort}`,
          },
        ],
      },
    }
  }
}