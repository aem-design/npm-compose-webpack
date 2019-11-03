"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const lodash_1 = require("lodash");
const xml2js_1 = __importDefault(require("xml2js"));
const webpack_config_utils_1 = require("webpack-config-utils");
const config_1 = require("./config");
// Internal
const mavenConfigs = {};
const xmlParser = new xml2js_1.default.Parser();
let ifUtilsInstance = null;
/**
 * Retrieve the Maven configuration using the given `filePath`.
 *
 * @private
 * @param {string} filePath Path to load the Maven configuration
 * @return {string}
 */
function getMavenConfigurationFromFile(filePath) {
    if (mavenConfigs[filePath]) {
        return mavenConfigs[filePath];
    }
    return (mavenConfigs[filePath] = fs_1.readFileSync(path_1.resolve(__dirname, filePath), 'utf-8'));
}
/**
 * Gets the Maven configuration from the file system and returns the value requested.
 *
 * @param {MavenConfig} config Maven configuration
 * @return {string} Found value or the given `fallback`
 */
function getMavenConfigurationValueByPath({ fallback, parser, path: propPath, pom }) {
    let value;
    xmlParser.parseString(getMavenConfigurationFromFile(pom), (_, { project }) => {
        const properties = project.properties[0];
        value = lodash_1.get(properties, propPath, fallback);
        if (parser) {
            value = parser(value);
        }
    });
    return value;
}
exports.getMavenConfigurationValueByPath = getMavenConfigurationValueByPath;
/**
 * Create an if utilities instance.
 *
 * @return {ifUtilsInstance}
 */
function getIfUtilsInstance() {
    if (!ifUtilsInstance) {
        ifUtilsInstance = webpack_config_utils_1.getIfUtils(config_1.environment);
    }
    return ifUtilsInstance;
}
exports.getIfUtilsInstance = getIfUtilsInstance;
