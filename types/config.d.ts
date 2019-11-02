import webpack from 'webpack'

import { ConfigurationType } from '../src/enum'
import { ProjectMap } from './project'

export interface Configuration {
  [ConfigurationType.MAVEN_PARENT]: string;
  [ConfigurationType.MAVEN_PROJECT]: string;
  [ConfigurationType.PATH_CLIENTLIBS]: string | false;
  [ConfigurationType.PATH_PUBLIC]: string;
  [ConfigurationType.PATH_PUBLIC_AEM]: string;
  [ConfigurationType.PATH_SOURCE]: string;
}

export interface Environment extends webpack.ParserOptions {
  mode: 'development' | 'production';
  project: string;
}

export interface WebpackConfiguration {
  projects?: ProjectMap;
}
