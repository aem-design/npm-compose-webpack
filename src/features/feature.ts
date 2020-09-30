import webpack from 'webpack'

import {
  DependenciesMap,
} from '@/types'

import {
  DependencyType,
} from '@/types/enums'

import {
  FeatureContract,
  FeatureEnvironment,
} from '@/types/feature'

import type {
  WebpackAliases,
} from '@/types/webpack'

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

  public defineWebpackConfiguration(): webpack.Configuration {
    return {
      module: {
        rules: this.rules(),
      },

      plugins: this.plugins(),

      resolve: {
        alias: this.aliases(),
      },

      ...this.arbitraryUpdates(),
    }
  }

  public getFeatureDependencies(): DependenciesMap {
    return {
      [DependencyType.DEV]     : [],
      [DependencyType.NON_DEV] : [],
    }
  }

  public aliases(): WebpackAliases {
    return {}
  }

  public arbitraryUpdates(): webpack.Configuration {
    return {}
  }

  public plugins(): webpack.WebpackPluginInstance[] {
    return []
  }

  public rules(): webpack.RuleSetRule[] {
    return []
  }
}
