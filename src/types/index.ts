import sass from 'sass'
import webpack from 'webpack'
import wds from 'webpack-dev-server'

import {
  ConfigurationType,
  DependencyType,
  Features,
} from './enums'

import {
  MavenConfig,
  MavenConfigMap,
  SavedMavenConfig,
} from './maven'

import {
  WebpackConfiguration,
  WebpackParserOptions,
} from './webpack'

export {
  MavenConfig,
  MavenConfigMap,
  SavedMavenConfig,
}

export interface Arguments {
  [x: string]: unknown;

  config: string;
  dev: boolean;
  prod: boolean;
}

export interface RuntimeEnvironment extends Environment {
  /**
   * Paths constructed from the runtime configuration.
   */
  paths: Partial<RuntimePaths>;
}

export interface RuntimeConfiguration extends webpack.Configuration {
  devServer: wds.Configuration;
}

export interface RuntimePaths {
  aem: string;
  out: string | boolean;
  project: ProjectPaths;
  src: string;
}

export interface ProjectPaths {
  public: string;
  src: string;
}

export interface Configuration {
  [ConfigurationType.MAVEN_PARENT]: string;
  [ConfigurationType.MAVEN_PROJECT]: string;
  [ConfigurationType.PATH_PUBLIC]: string;
  [ConfigurationType.PATH_PUBLIC_AEM]: string;
  [ConfigurationType.PATH_SOURCE]: string;
}

export interface Environment extends WebpackParserOptions {
  analyzer: boolean;
  aem: AEMEnvironment;
  clean: boolean;
  eslint: boolean;
  hmr: boolean;
  maven: boolean;
  mode: 'development' | 'production';
  project: string;
  stylelint: boolean;
  watch: boolean;
}

export interface AEMEnvironment<P = number | false> {
  paths: {
    app: string;
    shared: string;
  };

  port: P;
}

export type ProjectsConfiguration = Record<string, Project>

export interface Project {
  additionalEntries?: AdditionalEntries;
  entryFile: string;
  fileMap?: FileMap;
  outputName: string;
}

export type AdditionalEntries = Record<string, string[]>

export type FileMap = Partial<Record<'header' | 'footer', string[]>>

export type RuntimeForWebpack<T = WebpackConfiguration> = ((env: RuntimeEnvironment) => Partial<T>) | Partial<T>

export type FeatureList = (keyof typeof Features)[]

export type CommandLineFlags = Partial<Pick<Environment, 'eslint' | 'stylelint'>>

export interface ComposeConfiguration {
  /**
   * Override CLI flags which are forced 100% of the time for each and every build.
   *
   * @example
   * {
   *   cliFlags: {
   *     eslint: false,
   *   },
   * }
   */
  cliFlags: CommandLineFlags;

  /**
   * Additional features that you would like. All dependencies and configurations are done so
   * automatically behind the scenes.
   *
   * @example
   * {
   *   features: ['vue'],
   * }
   */
  features: FeatureList;

  /**
   * The standard configuration is for configurations that are used for setup sequences.
   *
   * @example
   * {
   *   // banner, projects...
   * }
   */
  standard: StandardConfiguration;

  /**
   * Extend the default Webpack configuration provided.
   *
   * `webpack-merge` is used to merge in any custom configuration supplied.
   *
   * **NOTE**: Some properties from the standard webpack configuration cannot be extended,
   * this is because we handle some the base configuration using your `projects` configuration.
   *
   * @example
   * {
   *   webpack: {
   *     module: {
   *       rules: [
   *         new CopyWebpackPlugin(),
   *       ],
   *     },
   *   },
   * }
   * @example
   * {
   *   webpack: (env) => ({
   *     plugins: [
   *       new ESLintPlugin({
   *         failOnError: env.prod === true,
   *       }),
   *     ],
   *   }),
   * }
   */
  webpack: RuntimeForWebpack;
}

export interface StandardConfiguration {
  /**
   * Configuration for the banner that appears for non-production builds.
   *
   * @example
   * {
   *   banner: {
   *     font: 'Banner',
   *     text: 'Custom Text',
   *   },
   * }
   */
  banner: BannerConfiguration;

  /**
   * Should the custom (provided) configuration be merged with the default configuration?
   */
  mergeProjects: boolean;

  /**
   * Configuration for the your projects.
   *
   * @example
   * {
   *   project: {
   *     <name>: {
   *       outputName: 'myApp',
   *     },
   *   },
   * }
   */
  projects: ProjectsConfiguration;
}

export interface BannerConfiguration {
  /**
   * Toggle the visibility of the banner in the console.
   *
   * @default false
   */
  disable: boolean;

  /**
   * Define a custom font for the banner.
   *
   * @default '3D-ASCII'
   */
  font: figlet.Fonts;

  /**
   * Custom text for the banner.
   *
   * @default 'AEM.Design'
   */
  text: string;
}

/**
 * Custom options for the CSS loaders pre-defined.
 *
 * @example
 * {
 *   sass: {
 *     implementation: require('node-sass'),
 *   },
 * }
 */
export interface CSSLoaderOptions {
  sass?: {
    loader?: Record<string, any>;
    options?: sass.Options;
  };
}

export type DependenciesMap = {
  [key in DependencyType]: string[];
}
