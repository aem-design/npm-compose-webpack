import { resolve } from 'path'
import webpack from 'webpack'

import { removeEmpty } from 'webpack-config-utils'

import CopyPlugin from 'copy-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import LodashPlugin from 'lodash-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import StyleLintPlugin from 'stylelint-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

import {
  RuntimePaths,
} from '../types'

import {
  environment,
} from '../config'

import {
  getIfUtilsInstance,
} from '../support/helpers'

import {
  resolveDependency,
} from '../support/dependencies'

import ComposeMessages from './messages'

export default (paths: RuntimePaths): webpack.Plugin[] => {
  const cssExtractPath = paths.out as string || 'clientlibs-header/css'

  return removeEmpty<webpack.Plugin>([

    getIfUtilsInstance().ifNotWatch(new ComposeMessages()),
    getIfUtilsInstance().ifNotMaven(new webpack.ProgressPlugin()),

    /**
     * Copies static assets from our source folder into the public structure for AEM.
     *
     * @see https://webpack.js.org/plugins/copy-webpack-plugin
     */
    new CopyPlugin({
      // @ts-expect-error
      patterns: [
        {
          context          : resolve(paths.project.src),
          from             : 'resources',
          to               : resolve(paths.project.public, 'clientlibs-header/resources'),
          noErrorOnMissing : true,
        },
        {
          context          : resolve(paths.project.src),
          from             : 'css/*.css',
          to               : resolve(paths.project.public, 'clientlibs-header/css'),
          noErrorOnMissing : true,
        },
      ],
    }),

    /**
     * CSS extraction.
     * Pulls out our CSS from the defined entry path(s) and puts it into our AEM structure.
     *
     * @see https://webpack.js.org/plugins/mini-css-extract-plugin/
     */
    new MiniCssExtractPlugin({
      chunkFilename : `${cssExtractPath}/[id].css`,
      filename      : `${cssExtractPath}/[name].css`,
    }),

    /**
     * Validate our Sass code using Stylelint to ensure we are following our own good practices.
     *
     * @see https://webpack.js.org/plugins/stylelint-webpack-plugin
     */
    getIfUtilsInstance().ifStylelint(new StyleLintPlugin({
      context       : resolve(paths.project.src, 'scss'),
      emitErrors    : false,
      // @ts-ignore
      emitWarning   : true,
      // @ts-check
      failOnError   : false,
      files         : ['**/*.scss'],
      quiet         : false,
      // @ts-ignore
      stylelintPath : resolveDependency('stylelint', true, require.resolve('stylelint')),
      // @ts-check
    })),

    /**
     * Validate our JavaScript code using ESLint to ensure we are following our own good practices.
     *
     * @see https://github.com/webpack-contrib/eslint-webpack-plugin
     */
    getIfUtilsInstance().ifEslint(new ESLintPlugin({
      context     : resolve(paths.project.src, 'js'),
      emitError   : false,
      eslintPath  : resolveDependency('eslint', true, require.resolve('eslint')),
      failOnError : environment.mode === 'production',
      files       : ['**/*'],
      fix         : false,
      quiet       : false,
    })),

    /**
     * Ensure all chunks that are generated have a unique ID assigned to them instead of pseudo-random
     * ones which are good but don't provide enough uniqueness.
     *
     * @see https://webpack.js.org/plugins/hashed-module-ids-plugin
     */
    new webpack.HashedModuleIdsPlugin(),

    /**
     * Lodash tree-shaking helper!
     *
     * Make sure we aren't including the entire Lodash library but instead just a small subset of the
     * library to keep our vendor weight down.
     *
     * @see https://www.npmjs.com/package/lodash-webpack-plugin
     */
    new LodashPlugin({
      collections : true,
      shorthands  : true,
    }),

    /**
     * Define custom environment variables that can be exposed within the code base.
     *
     * @see https://webpack.js.org/plugins/define-plugin
     */
    new webpack.DefinePlugin({
      '__DEV__'  : environment.dev === true,
      '__PROD__' : environment.prod === true,
    }),

    /**
     * Bundle analyzer is used to showcase our overall bundle weight which we can use to find
     * heavy files and optimise the result for production.
     *
     * @see https://www.npmjs.com/package/webpack-bundle-analyzer
     */
    getIfUtilsInstance().ifAnalyzer(new BundleAnalyzerPlugin({
      openAnalyzer: false,
    })),

    /**
     * @see https://webpack.js.org/plugins/loader-options-plugin
     */
    getIfUtilsInstance().ifProd(new webpack.LoaderOptionsPlugin({
      minimize: true,
    })),

  ])
}
