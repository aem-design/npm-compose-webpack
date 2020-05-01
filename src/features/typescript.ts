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

import { DependencyType } from '../types/enums'

import Feature from './feature'

export default class TypeScript extends Feature {
  private readonly configFile = resolveConfigFile('tsconfig.json', 'configs/tsconfig.json')

  public getFeatureDependencies(): DependenciesMap {
    return {
      [DependencyType.DEV]: [
        'tsconfig-paths-webpack-plugin@^3.2.0',
        'ts-loader@^7.0.2',
        'typescript@^3.8.3',
      ],

      [DependencyType.NON_DEV]: [],
    }
  }

  public arbitraryUpdates(): webpack.Configuration {
    const TsconfigPathsPlugin = require(resolveDependency('tsconfig-paths-webpack-plugin'))

    setConfigurable('resolveExtensions', ['.ts', '.tsx'])

    return {
      resolve: {
        plugins: [
          new TsconfigPathsPlugin({
            configFile: this.configFile,
          }),
        ],
      },
    }
  }

  public rules(): webpack.RuleSetRule[] {
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
