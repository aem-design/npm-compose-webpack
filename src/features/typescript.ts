import webpack from 'webpack'

import {
  DependenciesMap,
} from '../types'

import {
  setConfigurable,
} from '../config'

import {
  resolveDependency,
} from '../support/dependencies'

import {
  resolveConfigFile,
} from '../support/helpers'

import Feature from './feature'

export default class TypeScript extends Feature {
  private readonly configFile = resolveConfigFile('tsconfig.json', 'configs/tsconfig.json')

  public getFeatureDependencies(): DependenciesMap {
    return {
      dev    : ['tsconfig-paths-webpack-plugin', 'ts-loader', 'typescript'],
      nonDev : [],
    }
  }

  protected arbitraryUpdates(): webpack.Configuration {
    const TsconfigPathsPlugin = require(resolveDependency('tsconfig-paths-webpack-plugin'))

    setConfigurable('resolveExtensions', ['.ts', '.tsx'])

    return {
      resolve: {
        extensions: ['.ts', '.tsx'],

        plugins: [
          new TsconfigPathsPlugin({
            configFile: this.configFile,
          }),
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
              configFile: this.configFile,
            },
          },
        ],
      },
    ]
  }
}
