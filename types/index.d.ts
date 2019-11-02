import webpack from 'webpack'

import { WebpackConfiguration } from './config'

declare const runtime: (configuration?: WebpackConfiguration) => ((webpackEnv: webpack.ParserOptions) => webpack.Configuration)

export default runtime

export interface Arguments {
  [x: string]: unknown;

  config: string;
  dev: boolean;
  prod: boolean;
}

export {
  Configuration,
  Environment,
  WebpackConfiguration,
} from './config'

export {
  ConfigurationType,
} from '../src/enum'

export {
  Project,
  ProjectMap,
} from './project'

export {
  MavenConfig,
  MavenConfigMap,
  SavedMavenConfig,
} from './maven'
