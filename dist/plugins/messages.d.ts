import webpack from 'webpack';
/**
 * All credit and inspiration goes to https://github.com/lukeed/webpack-messages
 */
export default class ComposeMessages implements webpack.Plugin {
    private readonly name;
    private clear;
    private printError;
    apply(compiler: webpack.Compiler): void;
}
//# sourceMappingURL=messages.d.ts.map