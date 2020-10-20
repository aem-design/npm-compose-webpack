import { resolve } from 'path'
import webpack from 'webpack'
import { removeEmpty } from 'webpack-config-utils'

import css from '@/support/css'

import type {
  DependenciesMap,
} from '@/types'

import {
  DependencyType,
  Features,
} from '@/types/enums'

import {
  FeatureOptions,
} from '@/types/feature'

import type {
  WebpackAliases,
} from '@/types/webpack'

import {
  setConfigurable,
} from '@/config'

import {
  resolveDependency,
} from '@/support/dependencies'

import Feature from '@/features/feature'

export default class Vue extends Feature<Features.vue> {
  protected get defaultOptions(): Required<FeatureOptions[Features.vue]> {
    return {
      enableDevTools : null,
      extractStyles  : false,
      optimisations  : [],
      runtimeOnly    : false,
      useOptionsAPI  : true,
      version        : 2,
    }
  }

  public getFeatureDependencies(): DependenciesMap {
    const dependencies = {
      [DependencyType.DEV]: [
        '@vue/cli-plugin-babel@^4.5.7',
        '@vue/cli-plugin-eslint@^4.5.7',
        '@vue/eslint-config-typescript@^7.0.0',
        'babel-preset-vue@^2.0.2',
        'vue-style-loader@^4.1.2',

        this.options.version === 3 ? 'vue-loader@^v16.0.0-beta.8' : 'vue-loader@^15.9.1',
        this.options.version === 3 ? '@vue/compiler-sfc' : 'vue-template-compiler',
      ],

      [DependencyType.NON_DEV]: [
        this.options.version === 3 ? 'vue@^3.0.0' : 'vue@^2.6.11',
      ],
    }

    if (this.options.version === 2) {
      dependencies[DependencyType.NON_DEV].push('vue-property-decorator@^8.4.2')
    }

    return dependencies
  }

  public aliases(): WebpackAliases {
    const aliasPath = this.options.version === 3
      ? this.options.runtimeOnly ? 'vue/dist/vue.runtime.esm-bundler.js' : 'vue/dist/vue.esm-bundler.js'
      : this.options.runtimeOnly ? 'vue/dist/vue.runtime.esm.js' : 'vue/dist/vue.esm.js'

    return {
      vue$: aliasPath,
    }
  }

  public arbitraryUpdates(): webpack.Configuration {
    setConfigurable('assetFilters', ['vue'])
    setConfigurable('resolveExtensions', ['vue'])

    const optimisations = [
      'vue',
      ...(this.options.version === 3 ? [] : ['vue-property-decorator']),
      ...this.options.optimisations,
    ]

    return {
      optimization: {
        splitChunks: {
          cacheGroups: {
            vue: {
              name: 'vue',
              test: new RegExp(`[\\/]node_modules[\\/](${optimisations.join('|')})[\\/]`),
            },
          },
        },
      },

      plugins: removeEmpty([
        this.options.version === 3 ? new webpack.DefinePlugin({
          __VUE_OPTIONS_API__   : JSON.stringify(this.options.useOptionsAPI),
          __VUE_PROD_DEVTOOLS__ : JSON.stringify(this.options.enableDevTools ?? this.env.mode === 'development'),
        }) : undefined,
      ]),
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
