import { resolve } from 'path'
import sass from 'sass'
import webpack from 'webpack'

import {
  CSSLoaderOptions,
} from '../types'

export default (environment: webpack.ParserOptions, options: CSSLoaderOptions = {}): webpack.RuleSetUseItem[] => ([
  {
    loader: 'css-loader',

    options: {
      importLoaders : 1,
      sourceMap     : environment.dev === true,
    },
  },
  {
    loader: 'postcss-loader',

    options: {
      ident     : 'postcss',
      sourceMap : environment.dev === true,

      config: {
        path: resolve(process.cwd(), 'postcss.config.js'),

        ctx: {
          prod: environment.prod === true,
        },
      },
    },
  },
  {
    loader: 'sass-loader',

    options: {
      implementation : sass,
      sourceMap      : environment.dev === true,

      sassOptions: {
        outputStyle : environment.dev === true ? 'expanded' : 'compressed',
        precision   : 5,
        ...(options.sass?.options ?? {}),
      },

      ...(options.sass?.loader ?? {}),
    },
  },
])
