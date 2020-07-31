import sass from 'sass'
import webpack from 'webpack'

import {
  CSSLoaderOptions,
  Environment,
  RuntimePaths,
} from '../types'

import {
  resolveConfigFile,
} from './helpers'

export default (
  { mode }: Environment & { paths: RuntimePaths },
  options: CSSLoaderOptions = {},
): webpack.RuleSetUseItem[] => ([
  {
    loader: 'css-loader',

    options: {
      esModule      : false,
      importLoaders : 2,
      sourceMap     : mode === 'development',
      url           : false,
    },
  },
  {
    ident  : 'postcss',
    loader : 'postcss-loader',

    options: {
      sourceMap: mode === 'development',

      config: {
        path: resolveConfigFile('postcss.config.js', 'configs/postcss.config.js'),

        ctx: {
          prod: mode === 'development',
        },
      },
    },
  },
  {
    loader: 'sass-loader',

    options: {
      implementation : sass,
      sourceMap      : mode === 'development',

      sassOptions: {
        outputStyle: mode === 'development' ? 'expanded' : 'compressed',

        ...(options.sass?.options ?? {}),
      } as sass.Options,

      ...(options.sass?.loader ?? {}),
    },
  },
])
