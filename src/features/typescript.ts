import { resolve } from 'path'
import webpack from 'webpack'

import {
  DependenciesMap,
} from '../types'

import {
  resolveDependency,
} from '../support/dependencies'

import Feature from './feature'

export default class TypeScript extends Feature {
  public getFeatureDependencies(): DependenciesMap {
    return {
      dev    : ['tsconfig-paths-webpack-plugin', 'ts-loader', 'typescript'],
      nonDev : [],
    }
  }

  protected arbitraryUpdates(): webpack.Configuration {
    const TsconfigPathsPlugin = require(resolveDependency('tsconfig-paths-webpack-plugin'))

    return {
      resolve: {
        extensions: ['.ts', '.tsx'],

        plugins: [
          new TsconfigPathsPlugin(),
        ],
      },
    }
  }

  protected rules(): webpack.RuleSetRule[] {
    return [
      {
        exclude : /node_modules/,
        test    : /\.[t]sx?$/,

        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',

            options: {
              configFile: resolve(process.cwd(), 'tsconfig.json'),
            },
          },
        ],
      },
    ]
  }
}
