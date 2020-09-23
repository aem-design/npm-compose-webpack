import webpack from 'webpack'
import wds from 'webpack-dev-server'

import type {
  WebpackIgnoredProps,
} from './enums'

declare module "webpack" {
  interface Configuration {
    devServer?: wds.Configuration;
  }
}

export type WebpackAliases = webpack.Resolve['alias']

export type WebpackConfiguration = Omit<webpack.Configuration, keyof typeof WebpackIgnoredProps>

export interface WebpackConfigurables {
  assetFilters: string[];
  resolveExtensions: string[];
}

export type WebpackParserOptions = Omit<webpack.ParserOptions, 'system'>
