"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const nodeModulesChildPath = path_1.resolve(process.cwd(), 'node_modules');
const nodeModulesCurrentPath = path_1.resolve(__dirname, '../../', 'node_modules');
exports.default = (env, options = {}) => ([
    {
        exclude: [nodeModulesChildPath, nodeModulesCurrentPath],
        loader: 'vue-loader',
        test: /\.vue$/,
    },
    {
        exclude: [nodeModulesChildPath, nodeModulesCurrentPath],
        test: /\.[jt]sx?$/,
        use: [
            {
                loader: 'babel-loader',
            },
            {
                loader: 'ts-loader',
                options: {
                    configFile: options.configFile ? options.configFile : path_1.resolve(process.cwd(), 'tsconfig.json'),
                },
            },
        ],
    },
    {
        enforce: 'pre',
        exclude: [nodeModulesChildPath, nodeModulesCurrentPath],
        test: /\.js$/,
        use: ['eslint-loader'],
    },
    {
        enforce: 'pre',
        test: /\.js$/,
        use: ['source-map-loader'],
    },
]);
