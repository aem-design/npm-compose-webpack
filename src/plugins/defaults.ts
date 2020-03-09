import { resolve } from 'path'
import webpack from 'webpack'

import { removeEmpty } from 'webpack-config-utils'

import CopyWebpackPlugin from 'copy-webpack-plugin'
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
  return removeEmpty<webpack.Plugin>([

    getIfUtilsInstance().ifProd(new ComposeMessages()),
    getIfUtilsInstance().ifNotProd(new webpack.ProgressPlugin()),

    /**
     * Copies static assets from our source folder into the public structure for AEM.
     *
     * @see https://webpack.js.org/plugins/copy-webpack-plugin
     */
    new CopyWebpackPlugin([
      {
        context : resolve(paths.project.src, 'clientlibs-header/resources'),
        from    : './**/*.*',
        to      : resolve(paths.project.public, 'clientlibs-header/resources'),
      },
      {
        context : resolve(paths.project.src, 'clientlibs-header/css'),
        from    : './*.css',
        to      : resolve(paths.project.public, 'clientlibs-header/css'),
      },
    ]),

    /**
     * CSS extraction.
     * Pulls out our CSS from the defined entry path(s) and puts it into our AEM structure.
     *
     * @see https://webpack.js.org/plugins/mini-css-extract-plugin/
     */
    new MiniCssExtractPlugin({
      chunkFilename : `${paths.out || 'clientlibs-header/css'}/[id].css`,
      filename      : `${paths.out || 'clientlibs-header/css'}/[name].css`,
    }),

    /**
     * Validate our Sass code using Stylelint to ensure we are following our own good practices.
     *
     * @see https://webpack.js.org/plugins/stylelint-webpack-plugin
     */
    getIfUtilsInstance().ifStylelint(new StyleLintPlugin({
      context       : resolve(paths.project.src, 'scss'),
      // @ts-ignore
      emitError     : false,
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
      // TODO: Pass this via config
      files       : ['**/*.js'],
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
     * Exposè for 3rd-party vendors & libraries.
     *
     * @see https://webpack.js.org/plugins/provide-plugin
     * @see https://github.com/shakacode/bootstrap-loader#bootstrap-4-internal-dependency-solution
     */
    new webpack.ProvidePlugin({
      Alert     : 'exports-loader?Alert!bootstrap/js/dist/alert',
      Button    : 'exports-loader?Button!bootstrap/js/dist/button',
      Carousel  : 'exports-loader?Carousel!bootstrap/js/dist/carousel',
      Collapse  : 'exports-loader?Collapse!bootstrap/js/dist/collapse',
      Dropdown  : 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
      Modal     : 'exports-loader?Modal!bootstrap/js/dist/modal',
      Popover   : 'exports-loader?Popover!bootstrap/js/dist/popover',
      Popper    : ['popper.js', 'default'],
      Scrollspy : 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
      Tab       : 'exports-loader?Tab!bootstrap/js/dist/tab',
      Tooltip   : 'exports-loader?Tooltip!bootstrap/js/dist/tooltip',
      Util      : 'exports-loader?Util!bootstrap/js/dist/util',
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
