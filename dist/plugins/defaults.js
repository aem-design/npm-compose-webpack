"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const webpack_1 = __importDefault(require("webpack"));
const webpack_config_utils_1 = require("webpack-config-utils");
const clean_webpack_plugin_1 = require("clean-webpack-plugin");
const copy_webpack_plugin_1 = __importDefault(require("copy-webpack-plugin"));
const imagemin_webpack_plugin_1 = __importDefault(require("imagemin-webpack-plugin"));
const lodash_webpack_plugin_1 = __importDefault(require("lodash-webpack-plugin"));
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const stylelint_webpack_plugin_1 = __importDefault(require("stylelint-webpack-plugin"));
const vue_loader_1 = require("vue-loader");
const webpack_bundle_analyzer_1 = require("webpack-bundle-analyzer");
const Types = __importStar(require("../ast"));
const config_1 = require("../config");
const helpers_1 = require("../helpers");
const messages_1 = __importDefault(require("./messages"));
exports.ComposeMessages = messages_1.default;
exports.default = () => {
    const clientLibsPath = config_1.getConfiguration(Types.ConfigurationType.PATH_CLIENTLIBS);
    const publicPath = config_1.getConfiguration(Types.ConfigurationType.PATH_PUBLIC);
    const projectName = config_1.environment.project;
    const sourcePath = config_1.getProjectPath(Types.ConfigurationType.PATH_SOURCE);
    return webpack_config_utils_1.removeEmpty([
        /**
         * When enabled, we clean up our public directory for the current project so we are using old
         * assets when sending out files for our builds and pipelines.
         *
         * @see https://github.com/johnagan/clean-webpack-plugin
         */
        config_1.environment.clean === true ? new clean_webpack_plugin_1.CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path_1.resolve(publicPath, projectName, '**/*')],
        }) : undefined,
        /**
         * Copies static assets from our source folder into the public structure for AEM.
         *
         * @see https://webpack.js.org/plugins/copy-webpack-plugin
         */
        new copy_webpack_plugin_1.default([
            {
                context: path_1.resolve(sourcePath, 'clientlibs-header/resources'),
                from: './**/*.*',
                to: path_1.resolve(publicPath, projectName, 'clientlibs-header/resources'),
            },
            {
                context: path_1.resolve(sourcePath, 'clientlibs-header/css'),
                from: './*.css',
                to: path_1.resolve(publicPath, projectName, 'clientlibs-header/css'),
            },
        ]),
        /**
         * CSS extraction.
         * Pulls out our CSS from the defined entry path(s) and puts it into our AEM structure.
         *
         * @see https://webpack.js.org/plugins/mini-css-extract-plugin
         */
        new mini_css_extract_plugin_1.default({
            chunkFilename: `${clientLibsPath || ''}clientlibs-header/css/[id].css`,
            filename: `${clientLibsPath || ''}clientlibs-header/css/[name].css`,
        }),
        /**
         * Validate our Sass code using Stylelint to ensure we are following our own good practices.
         *
         * @see https://webpack.js.org/plugins/stylelint-webpack-plugin
         */
        config_1.environment.maven !== true ? new stylelint_webpack_plugin_1.default({
            context: path_1.resolve(sourcePath, 'scss'),
            emitErrors: false,
            failOnError: false,
            files: ['**/*.scss'],
            quiet: false,
        }) : undefined,
        /**
         * Compress any static assets in our build.
         *
         * @see https://www.npmjs.com/package/imagemin-webpack-plugin
         */
        helpers_1.ifProd(new imagemin_webpack_plugin_1.default({
            test: /\.(jpe?g|png|gif|svg)$/i,
        })),
        /**
         * Ensure all chunks that are generated have a unique ID assigned to them instead of pseudo-random
         * ones which are good but don't provide enough uniqueness.
         *
         * @see https://webpack.js.org/plugins/hashed-module-ids-plugin
         */
        new webpack_1.default.HashedModuleIdsPlugin(),
        /**
         * Lodash tree-shaking helper!
         *
         * Make sure we aren't including the entire Lodash library but instead just a small subset of the
         * library to keep our vendor weight down.
         *
         * @see https://www.npmjs.com/package/lodash-webpack-plugin
         */
        new lodash_webpack_plugin_1.default({
            collections: true,
            shorthands: true,
        }),
        /**
         * Vue compilation configuration.
         *
         * @see https://vue-loader.vuejs.org/guide/
         */
        new vue_loader_1.VueLoaderPlugin(),
        /**
         * Expose´ for 3rd-party vendors & libraries.
         *
         * @see https://webpack.js.org/plugins/provide-plugin
         * @see https://github.com/shakacode/bootstrap-loader#bootstrap-4-internal-dependency-solution
         */
        new webpack_1.default.ProvidePlugin({
            Alert: 'exports-loader?Alert!bootstrap/js/dist/alert',
            Button: 'exports-loader?Button!bootstrap/js/dist/button',
            Carousel: 'exports-loader?Carousel!bootstrap/js/dist/carousel',
            Collapse: 'exports-loader?Collapse!bootstrap/js/dist/collapse',
            Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
            Modal: 'exports-loader?Modal!bootstrap/js/dist/modal',
            Popover: 'exports-loader?Popover!bootstrap/js/dist/popover',
            Popper: ['popper.js', 'default'],
            Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
            Tab: 'exports-loader?Tab!bootstrap/js/dist/tab',
            Tooltip: 'exports-loader?Tooltip!bootstrap/js/dist/tooltip',
            Util: 'exports-loader?Util!bootstrap/js/dist/util',
        }),
        /**
         * Define custom environment variables that can be exposed within the code base.
         *
         * @see https://webpack.js.org/plugins/define-plugin
         */
        new webpack_1.default.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(config_1.environment.mode),
            },
            '__DEV__': config_1.environment.dev === true,
            '__PROD__': config_1.environment.prod === true,
        }),
        /**
         * Bundle analyzer is used to showcase our overall bundle weight which we can use to find
         * heavy files and optimise the result for production.
         *
         * @see https://www.npmjs.com/package/webpack-bundle-analyzer
         */
        config_1.environment.dev === true && config_1.environment.maven !== true && config_1.environment.deploy !== true ? new webpack_bundle_analyzer_1.BundleAnalyzerPlugin({
            openAnalyzer: false,
        }) : undefined,
        /**
         * @see https://webpack.js.org/plugins/loader-options-plugin
         */
        helpers_1.ifProd(new webpack_1.default.LoaderOptionsPlugin({
            minimize: true,
        })),
    ]);
};
