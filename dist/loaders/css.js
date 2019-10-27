"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.default = (env, options = {}) => ([
    {
        loader: 'css-loader',
        options: {
            importLoaders: 1,
            sourceMap: env.dev === true,
        },
    },
    {
        loader: 'postcss-loader',
        options: {
            ident: 'postcss',
            sourceMap: env.dev === true,
            config: {
                path: path_1.resolve(__dirname, '../postcss.config.js'),
                ctx: {
                    prod: env.prod === true,
                },
            },
        },
    },
    {
        loader: 'sass-loader',
        options: Object.assign({ implementation: require('sass'), sourceMap: env.dev === true, sassOptions: Object.assign({ outputStyle: env.dev === true ? 'expanded' : 'compressed', precision: 5 }, (options.sassOptions || {})) }, (options.sassLoader || {})),
    },
]);
