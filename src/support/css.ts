import sass from 'sass'
import webpack from 'webpack'

import type {
  CSSLoaderOptions,
  Environment,
  RuntimePaths,
} from '@/types'

export default (
  { mode }: Environment & { paths: RuntimePaths },
  // eslint-disable-next-line
  options: CSSLoaderOptions = {},
): webpack.RuleSetRule[] => ([
  {
    loader: 'css-loader',

    options: {
      esModule      : false,
      importLoaders : 2,
      sourceMap     : mode === 'development',
      url           : false,

      modules: {
        compileType: 'icss',
      },
    },
  },
  {
    loader: 'postcss-loader',

    options: {
      sourceMap: mode === 'development',
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
