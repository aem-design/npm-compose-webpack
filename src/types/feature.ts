import webpack from 'webpack'

import {
  WebpackAliases,
  WebpackConfiguration,
} from './webpack'

import {
  Environment,
  RuntimePaths,
} from '.'

export interface FeatureEnvironment {
  general: Environment;
  paths: RuntimePaths;
  webpack: WebpackConfiguration;
}

export interface FeatureDependencies {
  dev: string[];
  nonDev: string[];
}

export abstract class FeatureContract {
  protected abstract getFeatureDependencies(): FeatureDependencies;

  protected abstract aliases(): WebpackAliases;
  protected abstract plugins(): webpack.Plugin[];
  protected abstract rules(): webpack.RuleSetRule[];
}
