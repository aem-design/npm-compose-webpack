import webpack from 'webpack'
import _concat from 'lodash/concat'
import _merge from 'lodash/merge'

import {
  RuntimeConfiguration,
} from '../types'

import {
  DependencyType,
} from '../types/enums'

import {
  FeatureContract,
  FeatureDependencies,
  FeatureEnvironment,
} from '../types/feature'

import {
  WebpackAliases,
} from '../types/webpack'

export {
  FeatureContract,
  FeatureDependencies,
  FeatureEnvironment,
}

export default class Feature extends FeatureContract {
  protected env!: FeatureEnvironment

  private readonly dependencies: string[] = [];
  private readonly devDependencies: string[] = [];

  public constructor(env: FeatureEnvironment) {
    super()

    const { dev, nonDev } = this.getFeatureDependencies()

    this.dependencies    = nonDev
    this.devDependencies = dev
    this.env             = env
  }

  public getDependencyList(type: DependencyType): string[] {
    return type === DependencyType.DEV ? this.devDependencies : this.dependencies
  }

  public defineWebpackConfiguration(webpackConfig: RuntimeConfiguration): RuntimeConfiguration {
    const updatedConfig = webpackConfig

    if (updatedConfig.module) {
      updatedConfig.module.rules = _concat(updatedConfig.module.rules, this.rules())
    }

    if (updatedConfig.plugins) {
      updatedConfig.plugins = _concat(updatedConfig.plugins, this.plugins())
    }

    if (updatedConfig.resolve) {
      updatedConfig.resolve.alias = _merge(updatedConfig.resolve.alias, this.aliases())
    }

    return webpackConfig
  }

  protected getFeatureDependencies(): FeatureDependencies {
    return {
      dev    : [],
      nonDev : [],
    }
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
