import webpack from 'webpack'
import wds from 'webpack-dev-server'

import type {
  WebpackIgnoredProps,
} from '@/types/enums'

declare module 'webpack' {
  interface Configuration {
    devServer?: wds.Configuration;
  }
}

export type WebpackAliases = webpack.ResolveOptions['alias']

export type WebpackConfiguration = Omit<webpack.Configuration, keyof typeof WebpackIgnoredProps>

export interface WebpackConfigurables {
  assetFilters: string[];
  resolveExtensions: string[];
}

export type WebpackParserOptions = Record<string, any>
