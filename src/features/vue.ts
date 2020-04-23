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
  setConfigurable,
} from '../config'

import {
  resolveDependency,
} from '../support/dependencies'

import { DependencyType } from '../types/enums'

import Feature from './feature'

export default class Vue extends Feature {
  public getFeatureDependencies(): DependenciesMap {
    return {
      [DependencyType.DEV]: [
        'vue-loader',
        'vue-style-loader',
        'vue-template-compiler',
      ],

      [DependencyType.NON_DEV]: [
        'vue-property-decorator',
        'vue',
      ],
    }
  }

  public aliases(): WebpackAliases {
    return {
      vue$: this.env.mode === 'development' ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.min.js',
    }
  }

  public arbitraryUpdates(): webpack.Configuration {
    setConfigurable('assetFilters', ['vue'])

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

  public plugins(): webpack.Plugin[] {
    const VueLoaderPlugin = require(resolveDependency('vue-loader/lib/plugin'))

    return [
      new VueLoaderPlugin(),
    ]
  }

  public rules(): webpack.RuleSetRule[] {
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
              hmr       : this.env.hmr === true,
              sourceMap : true,
            },
          },
          ...css(this.env, {
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
