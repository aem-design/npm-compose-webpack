import webpack from 'webpack'

import type {
  WebpackAliases,
  WebpackConfiguration,
} from './webpack'

import type {
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
  public abstract plugins(): webpack.WebpackPluginInstance[];
  public abstract rules(): webpack.RuleSetRule[];
}
