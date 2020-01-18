import { resolve } from 'path'
import webpack from 'webpack'

import { removeEmpty } from 'webpack-config-utils'

import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import LodashPlugin from 'lodash-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import StyleLintPlugin from 'stylelint-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

import { ConfigurationType } from '../enum'

import {
  environment,

  getConfiguration,
  getProjectPath,
} from '../config'

import { getIfUtilsInstance } from '../helpers'

import ComposeMessages from './messages'

export {
  ComposeMessages,
}

export default (): webpack.Plugin[] => {
  const clientLibsPath = getConfiguration(ConfigurationType.PATH_CLIENTLIBS)
  const publicPath     = getProjectPath(ConfigurationType.PATH_PUBLIC)
  const sourcePath     = getProjectPath(ConfigurationType.PATH_SOURCE)

  return removeEmpty<webpack.Plugin>([

    /**
     * When enabled, we clean up our public directory for the current project so we are using old
     * assets when sending out files for our builds and pipelines.
     *
     * @see https://github.com/johnagan/clean-webpack-plugin
     */
    getIfUtilsInstance().ifClean(new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [resolve(publicPath, '**/*')],
    }) as unknown as webpack.Plugin),

    /**
     * Copies static assets from our source folder into the public structure for AEM.
     *
     * @see https://webpack.js.org/plugins/copy-webpack-plugin
     */
    new CopyWebpackPlugin([
      {
        context : resolve(sourcePath, 'clientlibs-header/resources'),
        from    : './**/*.*',
        to      : resolve(publicPath, 'clientlibs-header/resources'),
      },
      {
        context : resolve(sourcePath, 'clientlibs-header/css'),
        from    : './*.css',
        to      : resolve(publicPath, 'clientlibs-header/css'),
      },
    ]) as unknown as webpack.Plugin,

    /**
     * CSS extraction.
     * Pulls out our CSS from the defined entry path(s) and puts it into our AEM structure.
     *
     * @see https://webpack.js.org/plugins/mini-css-extract-plugin
     */
    new MiniCssExtractPlugin({
      chunkFilename : `${clientLibsPath || ''}clientlibs-header/css/[id].css`,
      filename      : `${clientLibsPath || ''}clientlibs-header/css/[name].css`,
    }) as unknown as webpack.Plugin,

    /**
     * Validate our Sass code using Stylelint to ensure we are following our own good practices.
     *
     * @see https://webpack.js.org/plugins/stylelint-webpack-plugin
     */
    getIfUtilsInstance().ifMaven(new StyleLintPlugin({
      context     : resolve(sourcePath, 'scss'),
      emitErrors  : false,
      failOnError : false,
      files       : ['**/*.scss'],
      quiet       : false,
    }) as unknown as webpack.Plugin),

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
    }) as unknown as webpack.Plugin,

    /**
     * Vue compilation configuration.
     *
     * @see https://vue-loader.vuejs.org/guide/
     */
    new VueLoaderPlugin(),

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
    }) as unknown as webpack.Plugin),

    /**
     * @see https://webpack.js.org/plugins/loader-options-plugin
     */
    getIfUtilsInstance().ifProd(new webpack.LoaderOptionsPlugin({
      minimize: true,
    })),

  ])
}
