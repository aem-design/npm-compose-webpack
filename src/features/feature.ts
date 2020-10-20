import _merge from 'lodash/merge'
import webpack from 'webpack'

import {
  DependenciesMap,
} from '@/types'

import {
  DependencyType,
  Features,
} from '@/types/enums'

import {
  FeatureContract,
  FeatureEnvironment,
  FeatureOptions,
} from '@/types/feature'

import type {
  WebpackAliases,
} from '@/types/webpack'

export {
  FeatureEnvironment,
}

export default class Feature<F extends Features, O = FeatureOptions[F]> extends FeatureContract<O> {
  protected env!: FeatureEnvironment
  protected options!: Required<O>

  public constructor(env: FeatureEnvironment, options: O) {
    super()

    this.env     = env
    this.options = _merge(this.defaultOptions, options)
  }

  protected get defaultOptions(): Required<O> {
    return {} as Required<O>
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
