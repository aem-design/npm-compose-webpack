import webpack from 'webpack'

import {
  WebpackAliases,
  WebpackConfiguration,
} from './webpack'

import {
  DependenciesMap,
  Environment,
  RuntimePaths,
} from '.'

export interface FeatureEnvironment extends Environment {
  paths: RuntimePaths;
  webpack: WebpackConfiguration;
}

export abstract class FeatureContract {
  public abstract getFeatureDependencies(): DependenciesMap;
  public abstract aliases(): WebpackAliases;
  public abstract arbitraryUpdates(): webpack.Configuration;
  public abstract plugins(): webpack.Plugin[];
  public abstract rules(): webpack.RuleSetRule[];
}
