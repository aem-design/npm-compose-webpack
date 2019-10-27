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
const chalk_1 = __importDefault(require("chalk"));
const dotenv_1 = __importDefault(require("dotenv"));
const figlet_1 = __importDefault(require("figlet"));
const path_1 = require("path");
const mini_css_extract_plugin_1 = __importDefault(require("mini-css-extract-plugin"));
const optimize_css_assets_webpack_plugin_1 = __importDefault(require("optimize-css-assets-webpack-plugin"));
const terser_webpack_plugin_1 = __importDefault(require("terser-webpack-plugin"));
const tsconfig_paths_webpack_plugin_1 = __importDefault(require("tsconfig-paths-webpack-plugin"));
const compose_support_1 = require("@aem-design/compose-support");
const Types = __importStar(require("./ast"));
const config_1 = require("./config");
const entry_1 = __importDefault(require("./entry"));
const helpers_1 = require("./helpers");
const loaders_1 = __importDefault(require("./loaders"));
const plugins_1 = __importDefault(require("./plugins"));
exports.default = (configuration = {}) => {
    const dotEnv = dotenv_1.default.config();
    const env = dotEnv.parsed;
    if (dotEnv.error || !env) {
        compose_support_1.logger.error("Failed to parse '.env' configuration due to an error!\n", dotEnv.error);
        process.exit(1);
        return;
    }
    /**
     * Support banner
     */
    console.log(figlet_1.default.textSync(env.BANNER_TEXT, env.BANNER_FONT));
    /**
     * General output
     */
    compose_support_1.logger.info('Starting up the webpack bundler...');
    compose_support_1.logger.info('');
    /**
     * Ensure our Maven config values are valid before continuing on...
     */
    const { appsPath, authorPort, sharedAppsPath } = config_1.getMavenConfiguration();
    if (!(authorPort || appsPath || sharedAppsPath)) {
        compose_support_1.logger.error('Unable to continue due to missing or invalid Maven configuration values!');
        process.exit(1);
    }
    /**
     * Set any user-defined projects.
     */
    if (configuration.projects) {
        config_1.setProjects(configuration.projects);
    }
    compose_support_1.logger.info(chalk_1.default.bold('Maven configuration'));
    compose_support_1.logger.info('-------------------');
    compose_support_1.logger.info(chalk_1.default.bold('Author Port         :'), authorPort);
    compose_support_1.logger.info(chalk_1.default.bold('Apps Path           :'), appsPath);
    compose_support_1.logger.info(chalk_1.default.bold('Shared Apps Path    :'), sharedAppsPath);
    compose_support_1.logger.info('');
    /**
     * Begin Webpack!!
     */
    return (webpackEnv) => {
        config_1.setupEnvironment(webpackEnv);
        const flagDev = webpackEnv.dev === true;
        const flagProd = webpackEnv.prod === true;
        const flagHMR = webpackEnv.hmr === true;
        const project = webpackEnv.project;
        if (!flagHMR) {
            config_1.setConfiguration(Types.ConfigurationType.PATH_CLIENTLIBS, `${sharedAppsPath}/${appsPath}/clientlibs/${project}/`);
            config_1.setConfiguration(Types.ConfigurationType.PATH_PUBLIC_AEM, `/etc.clientlibs/${appsPath}/clientlibs/${project}/`);
        }
        // Webpack configuration
        const clientLibsPath = config_1.getConfiguration(Types.ConfigurationType.PATH_CLIENTLIBS);
        const entry = entry_1.default(flagHMR);
        const mode = flagDev ? 'development' : 'production';
        const projectPathPublic = config_1.getProjectPath(Types.ConfigurationType.PATH_PUBLIC);
        const projectPathSource = config_1.getProjectPath(Types.ConfigurationType.PATH_SOURCE);
        const publicPath = config_1.getConfiguration(Types.ConfigurationType.PATH_PUBLIC);
        const publicPathAEM = config_1.getConfiguration(Types.ConfigurationType.PATH_PUBLIC_AEM);
        const sourcePath = config_1.getConfiguration(Types.ConfigurationType.PATH_SOURCE);
        compose_support_1.logger.info(chalk_1.default.bold('Webpack Configuration'));
        compose_support_1.logger.info('---------------------');
        compose_support_1.logger.info(chalk_1.default.bold('Compilation Mode    :'), mode);
        compose_support_1.logger.info(chalk_1.default.bold('Project Name        :'), project);
        compose_support_1.logger.info(chalk_1.default.bold('Hot Reloading?      :'), webpackEnv.hmr ? 'yes' : 'no');
        compose_support_1.logger.info(chalk_1.default.bold('Client Libary Path  :'), clientLibsPath);
        compose_support_1.logger.info(chalk_1.default.bold('Public Path         :'), publicPath);
        compose_support_1.logger.info(chalk_1.default.bold('Public Path (AEM)   :'), publicPathAEM);
        compose_support_1.logger.info(chalk_1.default.bold('Source Path         :'), sourcePath);
        compose_support_1.logger.info('');
        compose_support_1.logger.info(chalk_1.default.bold('Entry Configuration'));
        compose_support_1.logger.info('-------------------');
        console.log(JSON.stringify(entry, null, 2));
        return {
            context: sourcePath,
            devtool: helpers_1.ifDev(flagHMR ? 'cheap-module-source-map' : 'cheap-module-eval-source-map'),
            entry,
            mode,
            output: {
                chunkFilename: `${clientLibsPath || ''}clientlibs-footer/resources/chunks/[name]${flagProd ? '.[contenthash:8]' : ''}.js`,
                filename: `${clientLibsPath || ''}clientlibs-footer/js/[name].js`,
                path: projectPathPublic,
                publicPath: publicPathAEM,
            },
            module: {
                rules: [
                    {
                        include: [path_1.resolve(projectPathSource, 'scss')],
                        test: /\.scss$/,
                        use: [
                            flagHMR ? {
                                loader: 'style-loader',
                            } : { loader: mini_css_extract_plugin_1.default.loader },
                            ...loaders_1.default.css(webpackEnv),
                        ],
                    },
                    {
                        include: [path_1.resolve(projectPathSource, 'js/components')],
                        test: /\.scss$/,
                        use: [
                            {
                                loader: 'vue-style-loader',
                                options: {
                                    hmr: flagHMR,
                                    sourceMap: true,
                                },
                            },
                            ...loaders_1.default.css(webpackEnv, {
                                sassOptions: {
                                    data: `@import 'setup';`,
                                    includePaths: [path_1.resolve(projectPathSource, 'scss')],
                                },
                            }),
                        ],
                    },
                    {
                        test: /\.css$/,
                        use: [
                            {
                                loader: mini_css_extract_plugin_1.default.loader,
                            },
                            ...loaders_1.default.css(webpackEnv),
                        ],
                    },
                    {
                        loader: 'file-loader',
                        test: /\.(png|jpg|gif|eot|ttf|svg|woff|woff2)$/,
                        options: {
                            context: `src/${webpackEnv.project}`,
                            emitFile: flagDev,
                            name: '[path][name].[ext]',
                            publicPath(url, resourcePath, context) {
                                return `${flagHMR ? '/' : '../'}${path_1.relative(context, resourcePath)}`;
                            },
                        },
                    },
                    {
                        test: require.resolve('jquery'),
                        use: [
                            {
                                loader: 'expose-loader',
                                options: 'jQuery',
                            },
                            {
                                loader: 'expose-loader',
                                options: '$',
                            },
                        ],
                    },
                    ...loaders_1.default.js(webpackEnv),
                ],
            },
            optimization: {
                minimizer: [
                    new terser_webpack_plugin_1.default({
                        cache: true,
                        sourceMap: false,
                        extractComments: {
                            condition: true,
                            banner() {
                                return `Copyright ${env.PROJECT_START}-${(new Date()).getFullYear()} ${env.PROJECT_NAME}`;
                            },
                        },
                        terserOptions: {
                            ecma: 6,
                            safari10: true,
                            warnings: false,
                            compress: {
                                drop_console: true,
                            },
                            output: {
                                beautify: false,
                                comments: false,
                            },
                        },
                    }),
                    new optimize_css_assets_webpack_plugin_1.default({
                        canPrint: true,
                        cssProcessor: require('cssnano'),
                        cssProcessorPluginOptions: {
                            preset: ['default', {
                                    discardComments: {
                                        removeAll: true,
                                    },
                                }],
                        },
                    }),
                ],
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        jquery: flagHMR ? false : {
                            // @ts-ignore
                            filename: `${clientLibsPath || ''}clientlibs-header/js/vendorlib/jquery.js`,
                            // @ts-check
                            name: 'jquery',
                            test: /[\\/]node_modules[\\/](jquery)[\\/]/,
                        },
                        vue: {
                            name: 'vue',
                            test: /[\\/]node_modules[\\/](vue|vue-property-decorator)[\\/]/,
                        },
                    },
                },
            },
            plugins: [
                ...plugins_1.default.ComposeDefaults(),
            ],
            resolve: {
                alias: {
                    vue$: flagDev ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.min.js',
                },
                extensions: ['.ts', '.tsx', '.js'],
                plugins: [
                    new tsconfig_paths_webpack_plugin_1.default({
                        configFile: path_1.resolve(process.cwd(), 'tsconfig.json'),
                    }),
                ],
            },
            devServer: {
                contentBase: projectPathPublic,
                host: env.DEV_SERVER_HOST,
                open: false,
                port: parseInt(env.DEV_SERVER_PORT, 10),
                proxy: [
                    {
                        context: () => true,
                        target: `http://${webpackEnv.proxyHost || process.env.DEV_SERVER_PROXY_HOST || 'localhost'}:${authorPort}`,
                    },
                ],
            },
        };
    };
};
