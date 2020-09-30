import webpack from 'webpack'

let webpackCompiler: webpack.Compiler

/**
 * Sets the internal reference of the webpack compiler.
 */
export function registerWebpackCompiler(compiler: webpack.Compiler): void {
  webpackCompiler = compiler
}

/**
 * Retrieve the stored instance of the `webpack.Compiler`.
 */
export function getWebpackCompiler(): webpack.Compiler {
  return webpackCompiler
}
