"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const compose_support_1 = require("@aem-design/compose-support");
const enum_1 = require("./enum");
const helpers_1 = require("./helpers");
const defaults_1 = require("./defaults");
// Internal
const workingDirectory = process.cwd();
const configurationDefaults = {
    [enum_1.ConfigurationType.MAVEN_PARENT]: path_1.resolve(workingDirectory, '../pom.xml'),
    [enum_1.ConfigurationType.MAVEN_PROJECT]: path_1.resolve(workingDirectory, './pom.xml'),
    [enum_1.ConfigurationType.PATH_CLIENTLIBS]: false,
    [enum_1.ConfigurationType.PATH_PUBLIC]: path_1.resolve(workingDirectory, 'public'),
    [enum_1.ConfigurationType.PATH_PUBLIC_AEM]: '/',
    [enum_1.ConfigurationType.PATH_SOURCE]: path_1.resolve(workingDirectory, 'src'),
};
const configuration = Object.assign({}, configurationDefaults);
const configKeys = Object.values(enum_1.ConfigurationType);
let projects = {};
/**
 * Sets the required projects map. If none are supplied, the default map will be used instead.
 *
 * @param {ProjectMap} incomingProjects User defined projects to watch and build
 */
function setProjects(incomingProjects = null) {
    if (!incomingProjects || Object.keys(incomingProjects).length === 0) {
        projects = defaults_1.defaultProjects;
    }
    else {
        projects = incomingProjects;
    }
}
exports.setProjects = setProjects;
/**
 * Environment configuration for Webpack.
 * @var {Environment}
 */
exports.environment = {
    mode: 'development',
    project: '',
};
/**
 * Retrieve a stored configuration value by the given `key`.
 *
 * @param {ConfigurationType} key Configuration key
 * @return {*}
 */
function getConfiguration(key) {
    if (!configKeys.includes(key)) {
        throw new ReferenceError(`Unable to get configuration for ${key} as it isn't a valid configuration key. Avaliable configuration keys to use are:\n${configKeys.join(', ')}\n`);
    }
    return configuration[key];
}
exports.getConfiguration = getConfiguration;
/**
 * Store a new `value` for the given `key`.
 *
 * @param {ConfigurationType} key Configuration key
 * @param {*} value Configuration value
 * @return {void}
 */
function setConfiguration(key, value) {
    if (!configKeys.includes(key)) {
        throw new ReferenceError(`Unable to set configuration for ${key} as it isn't a valid configuration key. Avaliable configuration keys to use are:\n${configKeys.join(', ')}\n`);
    }
    configuration[key] = value;
}
exports.setConfiguration = setConfiguration;
/**
 * Stores our current Webpack configuration and environment variables.
 *
 * @param {webpack.ParserOptions} env Webpack environment configuration
 * @return {void}
 */
function setupEnvironment(env) {
    exports.environment = Object.assign(Object.assign({}, env), { mode: env.dev === true ? 'development' : 'production', project: env.project });
    // Ensure the project is valid
    if (!exports.environment.project) {
        compose_support_1.logger.error('Specify a project when running webpack eg --env.project="core"');
        process.exit(1);
    }
    return exports.environment;
}
exports.setupEnvironment = setupEnvironment;
/**
 * Retrieve the project configuration.
 *
 * @return {Project}
 */
function getProjectConfiguration() {
    return projects[exports.environment.project];
}
exports.getProjectConfiguration = getProjectConfiguration;
/**
 * Retrieve the project path for the given `path` key.
 *
 * @param {ConfigurationType} path Key of the path
 * @return {string}
 */
function getProjectPath(path) {
    return path_1.resolve(getConfiguration(path), exports.environment.project);
}
exports.getProjectPath = getProjectPath;
/**
 * Retrieves the Maven configuration values we need.
 *
 * @return {MavenConfigMap}
 */
function getMavenConfiguration() {
    return {
        appsPath: helpers_1.getMavenConfigurationValueByPath({
            parser: (value) => value[0],
            path: 'package.appsPath',
            pom: configuration[enum_1.ConfigurationType.MAVEN_PROJECT],
        }),
        authorPort: helpers_1.getMavenConfigurationValueByPath({
            parser: (value) => value[0],
            path: 'crx.port',
            pom: configuration[enum_1.ConfigurationType.MAVEN_PARENT],
        }),
        sharedAppsPath: helpers_1.getMavenConfigurationValueByPath({
            parser: (value) => value[0],
            path: 'package.path.apps',
            pom: configuration[enum_1.ConfigurationType.MAVEN_PROJECT],
        }),
    };
}
exports.getMavenConfiguration = getMavenConfiguration;
