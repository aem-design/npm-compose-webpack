import _concat from 'lodash/concat'
import _merge from 'lodash/merge'
import webpack from 'webpack'
import merge from 'webpack-merge'

import {
  mergeStrategy,
} from '../config'

import {
  DependenciesMap,
  RuntimeConfiguration,
} from '../types'

import {
  DependencyType,
} from '../types/enums'

import {
  FeatureContract,
  FeatureEnvironment,
} from '../types/feature'

import {
  WebpackAliases,
} from '../types/webpack'

export {
  FeatureContract,
  FeatureEnvironment,
}

export default class Feature extends FeatureContract {
  protected env!: FeatureEnvironment

  public constructor(env: FeatureEnvironment) {
    super()

    this.env = env
  }

  public defineWebpackConfiguration(webpackConfig: RuntimeConfiguration): RuntimeConfiguration {
    return merge.smartStrategy(mergeStrategy)(webpackConfig, {
      module: {
        rules: this.rules(),
      },

      plugins: this.plugins(),

      resolve: {
        alias: this.aliases(),
      },
    })
  }

  public getFeatureDependencies(): DependenciesMap {
    return {
      [DependencyType.DEV]     : [],
      [DependencyType.NON_DEV] : [],
    }
  }

  public getFeatureAssetFilters(): string[] {
    return []
  }

  protected aliases(): WebpackAliases {
    return {}
  }

  protected plugins(): webpack.Plugin[] {
    return []
  }

  protected rules(): webpack.RuleSetRule[] {
    return []
  }
}
