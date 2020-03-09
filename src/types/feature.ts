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
  public abstract getFeatureAssetFilters(): string[];

  protected abstract aliases(): WebpackAliases;
  protected abstract arbitraryUpdates(): webpack.Configuration;
  protected abstract plugins(): webpack.Plugin[];
  protected abstract rules(): webpack.RuleSetRule[];
}
