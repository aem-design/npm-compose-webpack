import { resolve } from 'path'
import webpack from 'webpack'

import css from '@/support/css'

import type {
  DependenciesMap,
} from '@/types'

import type {
  WebpackAliases,
} from '@/types/webpack'

import {
  setConfigurable,
} from '@/config'

import {
  resolveDependency,
} from '@/support/dependencies'

import {
  DependencyType,
} from '@/types/enums'

import Feature from '@/features/feature'

export default class Vue extends Feature {
  public getFeatureDependencies(): DependenciesMap {
    return {
      [DependencyType.DEV]: [
        '@vue/cli-plugin-babel@^4.3.1',
        '@vue/cli-plugin-eslint@^4.3.1',
        '@vue/compiler-sfc@^3.0.0',
        '@vue/eslint-config-typescript@^5.0.2',
        'babel-preset-vue@^2.0.2',
        'vue-loader@^v16.0.0-beta.8',
        'vue-style-loader@^4.1.2',
        'vue-template-compiler@^2.6.11',
      ],

      [DependencyType.NON_DEV]: [
        'vue@^2.6.11',
        'vue-property-decorator@^8.4.2',
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

  public plugins(): webpack.WebpackPluginInstance[] {
    const { VueLoaderPlugin } = require(resolveDependency('vue-loader'))

    return [
      new VueLoaderPlugin() as webpack.WebpackPluginInstance,
    ]
  }

  public rules(): webpack.RuleSetRule[] {
    return [
      {
        loader : 'vue-loader',
        test   : /\.vue$/,
      },
      {
        test: /\.(c|sc)ss$/,

        include: [
          resolve(this.env.paths.project.src, 'js/components'),
          resolve(process.cwd(), 'node_modules'),
        ],

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
                additionalData: `@import 'setup';`,
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
