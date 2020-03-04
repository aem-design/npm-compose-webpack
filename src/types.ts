import webpack from 'webpack'

import { ConfigurationType } from './enum'

export interface MavenConfigMap {
  authorPort: number;
  appsPath: string;
  sharedAppsPath: string;
}

export interface MavenConfig<R> {
  fallback?: R;
  parser?: (value: any) => R;
  path: string;
  pom: string;
}

export interface SavedMavenConfig {
  [key: string]: string;
}


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

export interface ProjectMap {
  [project: string]: Project;
}

export interface Project {
  additionalEntries?: {
    [entry: string]: string[];
  };

  entryFile: {
    js: string;
    sass: string;
  };

  fileMap?: {
    [key: string]: string[];
  };

  outputName: string;
}

export interface Arguments {
  [x: string]: unknown;

  config: string;
  dev: boolean;
  prod: boolean;
}

declare const runtime: (configuration?: WebpackConfiguration) => ((webpackEnv: webpack.ParserOptions) => webpack.Configuration)

export default runtime
