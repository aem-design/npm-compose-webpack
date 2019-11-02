import chalk from 'chalk'
import figlet from 'figlet'
import { get as _get } from 'lodash'
import { relative, resolve } from 'path'
import webpack from 'webpack'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

import { logger } from '@aem-design/compose-support'

import * as Types from '../types/index'

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

import { ifDev } from './helpers'

import loaders from './loaders'
import plugins from './plugins'

export default (
  configuration: Types.WebpackConfiguration = {},
  env: { [key: string]: any } = {},
) => {
  /**
   * Support banner
   */
  console.log(figlet.textSync(
    _get(env, 'banner.text', 'AEM.Design'),
    _get(env, 'banner.font', '3D-ASCII') as figlet.Fonts,
  ))

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

  /**
   * Begin Webpack!!
   */
  return (webpackEnv: webpack.ParserOptions): webpack.Configuration => {
    const environment = setupEnvironment({
      ...webpackEnv,
    })

    const flagDev  = environment.dev === true
    const flagProd = environment.prod === true
    const flagHMR  = environment.hmr === true
    const project  = environment.project

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
    const devServerProxyPort = _get(env, 'webpack.server.proxyPort', authorPort)
    const entry              = EntryConfiguration(flagHMR)
    const mode               = flagDev ? 'development' : 'production'
    const projectPathPublic  = getProjectPath(ConfigurationType.PATH_PUBLIC)
    const projectPathSource  = getProjectPath(ConfigurationType.PATH_SOURCE)
    const publicPath         = getConfiguration(ConfigurationType.PATH_PUBLIC)
    const publicPathAEM      = getConfiguration(ConfigurationType.PATH_PUBLIC_AEM)
    const sourcePath         = getConfiguration(ConfigurationType.PATH_SOURCE)

    logger.info(chalk.bold('Webpack Configuration'))
    logger.info('---------------------')
    logger.info(chalk.bold('Compilation Mode    :'), mode)
    logger.info(chalk.bold('Project Name        :'), project)
    logger.info(chalk.bold('Hot Reloading?      :'), environment.hmr ? 'yes' : 'no')
    logger.info(chalk.bold('Client Libary Path  :'), clientLibsPath)
    logger.info(chalk.bold('Public Path         :'), publicPath)
    logger.info(chalk.bold('Public Path (AEM)   :'), publicPathAEM)
    logger.info(chalk.bold('Source Path         :'), sourcePath)
    logger.info('')
    logger.info(chalk.bold('Entry Configuration'))
    logger.info('-------------------')
    console.log(JSON.stringify(entry, null, 2))

    return {
      context: sourcePath,
      devtool: ifDev(flagHMR ? 'cheap-module-source-map' : 'cheap-module-eval-source-map'),
      entry,
      mode,

      output: {
        chunkFilename : `${clientLibsPath || ''}clientlibs-footer/resources/chunks/[name]${flagProd ? '.[contenthash:8]' : ''}.js`,
        filename      : `${clientLibsPath || ''}clientlibs-footer/js/[name].js`,
        path          : projectPathPublic,
        publicPath    : publicPathAEM,
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
              ...loaders.css(webpackEnv, {
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
          ...loaders.js(webpackEnv),
        ],
      },

      optimization: {
        minimizer: [
          new TerserPlugin({
            cache     : true,
            sourceMap : false,

            extractComments: {
              condition: true,

              banner() {
                const projectName = _get(env, 'project.name', 'AEM.Design')
                const start       = _get(env, 'project.start', (new Date()).getFullYear())

                return `Copyright ${start}-${(new Date()).getFullYear()} ${projectName}`
              },
            },

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
          },
        },
      },

      plugins: [
        ...plugins.ComposeDefaults(),
        ..._get(env, 'webpack.plugins', []),
      ],

      resolve: {
        alias: {
          vue$: flagDev ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.min.js',
        },

        extensions: ['.ts', '.tsx', '.js'],

        // Resolve modules from the child project too so we don't get errors complaining about missing
        // dependencies which aren't anything to do with our CLI script.
        modules: [
          relative(__dirname, resolve(process.cwd(), 'node_modules')),
          'node_modules',
        ],

        plugins: [
          new TsconfigPathsPlugin(),
        ],
      },

      stats: 'minimal',

      devServer: {
        contentBase : projectPathPublic,
        host        : _get(env, 'webpack.server.host', '0.0.0.0'),
        open        : false,
        port        : parseInt(_get(env, 'webpack.server.port', 4504), 10),
        stats       : 'minimal',

        proxy: [
          {
            context : () => true,
            target  : `http://${_get(env, 'webpack.server.proxyHost', 'localhost')}:${devServerProxyPort}`,
          },
        ],
      },
    }
  }
}
