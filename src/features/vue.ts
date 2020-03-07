import { resolve } from 'path'
import webpack from 'webpack'

import css from '../support/css'

import {
  WebpackAliases,
} from '../types/webpack'
import Feature, { FeatureDependencies } from './feature'

export default class Vue extends Feature {
  protected getFeatureDependencies(): FeatureDependencies {
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

  protected aliases(): WebpackAliases {
    return {
      vue$: this.env.general.mode === 'development' ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.min.js',
    }
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
