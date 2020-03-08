import { resolve } from 'path'
import webpack from 'webpack'

import css from '../support/css'

import {
  DependenciesMap,
} from '../types'

import {
  WebpackAliases,
} from '../types/webpack'

import {
  resolveDependency,
} from '../support/dependencies'

import Feature from './feature'

export default class Vue extends Feature {
  public getFeatureDependencies(): DependenciesMap {
    return {
      dev: [
        'vue-loader',
        'vue-property-decorator',
        'vue-style-loader',
        'vue-template-compiler',
      ],

      nonDev: ['vue'],
    }
  }

  public getFeatureAssetFilters(): string[] {
    return ['vue']
  }

  protected aliases(): WebpackAliases {
    return {
      vue$: this.env.general.mode === 'development' ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.min.js',
    }
  }

  protected arbitraryUpdates(): webpack.Configuration {
    return {
      optimization: {
        splitChunks: {
          cacheGroups: {
            vue: {
              name: 'vue',
              test: /[\\/]node_modules[\\/](vue|vue-property-decorator)[\\/]/,
            },
          },
        },
      },
    }
  }

  protected plugins(): webpack.Plugin[] {
    const VueLoaderPlugin = require(resolveDependency('vue-loader/lib/plugin'))

    return [
      new VueLoaderPlugin(),
    ]
  }

  protected rules(): webpack.RuleSetRule[] {
    return [
      {
        exclude : /node_modules/,
        loader  : 'vue-loader',
        test    : /\.vue$/,
      },
      {
        include : [resolve(this.env.paths.project.src, 'js/components')],
        test    : /\.scss$/,

        use: [
          {
            loader: 'vue-style-loader',

            options: {
              hmr       : this.env.general.hmr === true,
              sourceMap : true,
            },
          },
          ...css(this.env.general, {
            sass: {
              loader: {
                prependData: `@import 'setup';`,
              },

              options: {
                includePaths : [resolve(this.env.paths.project.src, 'scss')],
              },
            },
          }),
        ],
      },
    ]
  }
}
