import { resolve } from 'path'
import webpack from 'webpack'

const nodeModulesChildPath   = resolve(process.cwd(), 'node_modules')
const nodeModulesCurrentPath = resolve(__dirname, '../../', 'node_modules')

export default (env: webpack.ParserOptions, options: {
  configFile?: string;
} = {}): webpack.RuleSetRule[] => ([
  {
    exclude : [nodeModulesChildPath, nodeModulesCurrentPath],
    loader  : 'vue-loader',
    test    : /\.vue$/,
  },
  {
    exclude : [nodeModulesChildPath, nodeModulesCurrentPath],
    test    : /\.[jt]sx?$/,

    use: [
      {
        loader: 'babel-loader',
      },
      {
        loader: 'ts-loader',

        options: {
          configFile: options.configFile ? options.configFile : resolve(process.cwd(), 'tsconfig.json'),
        },
      },
    ],
  },
  {
    enforce : 'pre',
    exclude : [nodeModulesChildPath, nodeModulesCurrentPath],
    test    : /\.js$/,
    use     : ['eslint-loader'],
  },
  {
    enforce : 'pre',
    test    : /\.js$/,
    use     : ['source-map-loader'],
  },
])
