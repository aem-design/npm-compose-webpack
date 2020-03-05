import sass from 'sass'
import webpack from 'webpack'
import wds from 'webpack-dev-server'

import { ConfigurationType } from './enum'

export interface CSSLoaderOptions {
  sass?: {
    loader?: {
      [key: string]: any;
    };

    options?: sass.Options;
  };
}

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
  hmr: boolean;
  mode: 'development' | 'production';
  project: string;
}

export interface WebpackEnvironment extends Environment {
  paths: Partial<ComposePaths>;
}

export interface Project {
  additionalEntries?: AdditionalEntriesConfiguration;
  entryFile: string;
  fileMap?: FileMapConfiguration;
  outputName: string;
}

export interface Arguments {
  [x: string]: unknown;

  config: string;
  dev: boolean;
  prod: boolean;
}

export interface ComposeWebpackConfiguration extends webpack.Configuration {
  devServer: wds.Configuration;
}

export interface ComposePaths {
  aem: string;
  project: ProjectPaths;
  src: string;
}

export interface ProjectPaths {
  public: string;
  src: string;
}

export interface ComposeConfiguration {
  standard: StandardConfiguration;
  webpack: ComposeRuntimeConfiguration<WebpackConfiguration>;
}

interface BannerConfiguration {
  disable: boolean;
  font: figlet.Fonts;
  text: string;
}

export interface ProjectsConfiguration {
  [projectName: string]: Project;
}

interface AdditionalEntriesConfiguration {
  [entry: string]: string[];
}

interface FileMapConfiguration {
  footer?: string[];
  header?: string[];
}

interface StandardConfiguration {
  banner: BannerConfiguration;
  projects: ProjectsConfiguration;
}

export interface WebpackConfiguration {
  cacheGroups: Pick<webpack.Options.SplitChunksOptions, 'cacheGroups'>;
  plugins: webpack.Plugin[];
  rules: webpack.Rule[];
  server: wds.Configuration;
}

export type ComposeRuntimeConfiguration<T = ComposeConfiguration> = ((env: WebpackEnvironment) => Partial<T>) | Partial<T>
