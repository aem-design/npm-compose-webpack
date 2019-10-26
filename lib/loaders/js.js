"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const nodeModulesPath = path_1.resolve(process.cwd(), 'node_modules');
exports.default = (env, options = {}) => ([
    {
        exclude: [nodeModulesPath],
        loader: 'vue-loader',
        test: /\.vue$/,
    },
    {
        exclude: [nodeModulesPath],
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
        exclude: [nodeModulesPath],
        test: /\.js$/,
        use: ['eslint-loader'],
    },
    {
        enforce: 'pre',
        test: /\.js$/,
        use: ['source-map-loader'],
    },
]);
