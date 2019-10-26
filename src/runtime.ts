import chalk from 'chalk'
import dotenv from 'dotenv'
import figlet from 'figlet'
import { relative, resolve } from 'path'
import webpack from 'webpack'

import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

import { logger } from '@aem-design/compose-support'

import { ConfigurationType } from './@types/enum'

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

export default (configuration: WebpackConfiguration = {}) => {
  const dotEnv = dotenv.config()
  const env    = dotEnv.parsed

  if (dotEnv.error || !env) {
    logger.error("Failed to parse '.env' configuration due to an error!\n", dotEnv.error)
    process.exit(1)

    return
  }

  /**
   * Support banner
   */
  console.log(figlet.textSync(
    env.BANNER_TEXT,
    env.BANNER_FONT as figlet.Fonts,
  ))

  /**
   * General output
   */
  logger.info('Starting up the webpack bundler...')
  logger.info('')

  /**
   * Ensure our Maven config values are valid before continuing on...
   */
  const { appsPath, authorPort, sharedAppsPath   } = getMavenConfiguration()

  if (!(authorPort || appsPath || sharedAppsPath)) {
    logger.error('Unable to continue due to missing or invalid Maven configuration values!')
    process.exit(1)
  }

  /**
   * Set any user-defined projects.
   */
  if (configuration.projects) {
    setProjects(configuration.projects)
  }

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
    setupEnvironment(webpackEnv)

    const flagDev  = webpackEnv.dev === true
    const flagProd = webpackEnv.prod === true
    const flagHMR  = webpackEnv.hmr === true
    const project  = webpackEnv.project

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
    const clientLibsPath    = getConfiguration(ConfigurationType.PATH_CLIENTLIBS)
    const entry             = EntryConfiguration(flagHMR)
    const mode              = flagDev ? 'development' : 'production'
    const projectPathPublic = getProjectPath(ConfigurationType.PATH_PUBLIC)
    const projectPathSource = getProjectPath(ConfigurationType.PATH_SOURCE)
    const publicPath        = getConfiguration(ConfigurationType.PATH_PUBLIC)
    const publicPathAEM     = getConfiguration(ConfigurationType.PATH_PUBLIC_AEM)
    const sourcePath        = getConfiguration(ConfigurationType.PATH_SOURCE)

    logger.info(chalk.bold('Webpack Configuration'))
    logger.info('---------------------')
    logger.info(chalk.bold('Compilation Mode    :'), mode)
    logger.info(chalk.bold('Project Name        :'), project)
    logger.info(chalk.bold('Hot Reloading?      :'), webpackEnv.hmr ? 'yes' : 'no')
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
              context  : `src/${webpackEnv.project}`,
              emitFile : flagDev,
              name     : '[path][name].[ext]',

              publicPath(url: string, resourcePath: string, context: string): string {
                return `${flagHMR ? '/' : '../'}${relative(context, resourcePath)}`
              },
            },
          },
          {
            test: require.resolve('jquery'),

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
                return `Copyright ${env.PROJECT_START}-${(new Date()).getFullYear()} ${env.PROJECT_NAME}`
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
      ],

      resolve: {
        alias: {
          vue$: flagDev ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.min.js',
        },

        extensions: ['.ts', '.tsx', '.js'],

        plugins: [
          new TsconfigPathsPlugin({
            configFile: resolve(process.cwd(), 'tsconfig.json'),
          }),
        ],
      },

      devServer: {
        contentBase : projectPathPublic,
        host        : env.DEV_SERVER_HOST,
        open        : false,
        port        : parseInt(env.DEV_SERVER_PORT, 10),

        proxy: [
          {
            context : () => true,
            target  : `http://${webpackEnv.proxyHost || process.env.DEV_SERVER_PROXY_HOST || 'localhost'}:${authorPort}`,
          },
        ],
      },
    }
  }
}
