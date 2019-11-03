#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const webpack_1 = __importDefault(require("webpack"));
const webpack_dev_server_1 = __importDefault(require("webpack-dev-server"));
const yargs_1 = __importDefault(require("yargs"));
const compose_support_1 = require("@aem-design/compose-support");
const index_1 = __importDefault(require("../index"));
const args = yargs_1.default
    .alias('h', 'help')
    .alias('v', 'version')
    .option('analyzer', {
    default: false,
    description: 'Enable the Bundle Analyzer plugin?',
    type: 'boolean',
})
    .option('clean', {
    default: true,
    description: 'Should the public directory for the specified project be cleaned?',
    type: 'boolean',
})
    .option('config', {
    default: 'compose.config.js',
    description: 'Compose configuration file name',
})
    .option('dev', {
    alias: 'd',
    default: false,
    description: 'Set the build mode to development',
    type: 'boolean',
})
    .option('maven', {
    default: false,
    description: 'Was the task started from within Maven?',
    type: 'boolean',
})
    .option('prod', {
    alias: 'p',
    default: false,
    description: 'Set the build mode to production',
    type: 'boolean',
})
    .option('project', {
    default: '',
    description: 'Name of the project to build',
    required: true,
    type: 'string',
})
    .option('watch', {
    default: false,
    description: 'Use webpack-dev-server to proxy AEM and serve changes in real-time',
    type: 'boolean',
})
    .example('aemdesign-compose --project=core', 'Basic usage')
    .example('aemdesign-compose --config <file name>', 'Custom compose configuration file')
    .showHelpOnFail(true)
    .version()
    .wrap(130)
    .argv;
/**
 * Is there a custom configuration file we can use?
 */
let composeConfiguration = {};
try {
    // tslint:disable-next-line
    composeConfiguration = require(path_1.resolve(process.cwd(), args.config));
}
catch (_) {
    compose_support_1.logger.warning('Unable to find compose configuration file');
}
/**
 * Start your engines...
 */
const webpackConfiguration = index_1.default({}, composeConfiguration)(args);
const webpackInstance = webpack_1.default(webpackConfiguration);
if (args.watch) {
    const devServer = new webpack_dev_server_1.default(webpackInstance);
    devServer.listen(webpackConfiguration.devServer.port, (err) => {
        if (err) {
            throw err;
        }
    });
}
else {
    webpackInstance.run((err) => {
        if (err) {
            throw err;
        }
    });
}
