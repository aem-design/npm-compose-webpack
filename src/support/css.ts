import { resolve } from 'path'
import sass from 'sass'
import webpack from 'webpack'

import {
  CSSLoaderOptions,
} from '../types'

export default (
  { dev, prod }: webpack.ParserOptions,
  options: CSSLoaderOptions = {},
): webpack.RuleSetUseItem[] => ([
  {
    loader: 'css-loader',

    options: {
      importLoaders : 1,
      sourceMap     : dev === true,
    },
  },
  {
    loader: 'postcss-loader',

    options: {
      ident     : 'postcss',
      sourceMap : dev === true,

      config: {
        path: resolve(process.cwd(), 'postcss.config.js'),

        ctx: {
          prod: prod === true,
        },
      },
    },
  },
  {
    loader: 'sass-loader',

    options: {
      implementation : sass,
      sourceMap      : dev === true,

      sassOptions: {
        outputStyle: dev === true ? 'expanded' : 'compressed',

        ...(options.sass?.options ?? {}),
      } as sass.Options,

      ...(options.sass?.loader || {}),
    },
  },
])
