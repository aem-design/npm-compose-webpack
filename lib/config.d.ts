import webpack from 'webpack';
import { ConfigurationType } from './@types/enum';
import { Project } from './@types/interface';
export { ConfigurationType, Project };
/**
 * Sets the required projects map. If none are supplied, the default map will be used instead.
 *
 * @param {ProjectMap} incomingProjects User defined projects to watch and build
 */
export declare function setProjects(incomingProjects: ProjectMap): void;
/**
 * Environment configuration for Webpack.
 * @var {Environment}
 */
export declare let environment: Environment;
/**
 * Retrieve a stored configuration value by the given `key`.
 *
 * @param {ConfigurationType} key Configuration key
 * @return {*}
 */
export declare function getConfiguration<T extends ConfigurationType, R extends Configuration[T]>(key: T): R;
/**
 * Store a new `value` for the given `key`.
 *
 * @param {ConfigurationType} key Configuration key
 * @param {*} value Configuration value
 * @return {void}
 */
export declare function setConfiguration<T extends ConfigurationType, V extends Configuration[T]>(key: T, value: V): void;
/**
 * Stores our current Webpack configuration and environment variables.
 *
 * @param {webpack.ParserOptions} env Webpack environment configuration
 * @return {void}
 */
export declare function setupEnvironment(env: webpack.ParserOptions): void;
/**
 * Retrieve the project configuration.
 *
 * @return {Project}
 */
export declare function getProjectConfiguration(): Project;
/**
 * Retrieve the project path for the given `path` key.
 *
 * @param {ConfigurationType} path Key of the path
 * @return {string}
 */
export declare function getProjectPath<T extends ConfigurationType>(path: T): string;
/**
 * Retrieves the Maven configuration values we need.
 *
 * @return {MavenConfigMap}
 */
export declare function getMavenConfiguration(): MavenConfigMap;
