"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const webpack_format_messages_1 = __importDefault(require("webpack-format-messages"));
const compose_support_1 = require("@aem-design/compose-support");
// Internal
const pluginName = 'compose-messages';
/**
 * All credit and inspiration goes to https://github.com/lukeed/webpack-messages
 */
class ComposeMessages {
    constructor() {
        this.name = chalk_1.default.bold('compose');
    }
    clear() {
        return process.stdout.write('\x1B[2J\x1B[3J\x1B[H\x1Bc');
    }
    printError(message, errors, warning = false) {
        const errorMessage = `${message}

    ${errors.join('')}`;
        this.clear();
        if (warning) {
            compose_support_1.logger.warning(errorMessage);
        }
        else {
            compose_support_1.logger.error(errorMessage);
        }
    }
    apply(compiler) {
        const onStart = () => {
            compose_support_1.logger.info(`Building ${this.name}...`);
        };
        const onComplete = (stats) => {
            const messages = webpack_format_messages_1.default(stats);
            if (messages.errors.length) {
                return this.printError(chalk_1.default.red(`Failed to compile ${this.name}!`), messages.errors);
            }
            if (messages.warnings.length) {
                return this.printError(chalk_1.default.yellow(`Compiled ${this.name} with warnings.`), messages.warnings, true);
            }
            if (stats.endTime && stats.startTime) {
                const compileTime = (stats.endTime - stats.startTime) / 1e3;
                compose_support_1.logger.info(chalk_1.default.green(`Completed ${this.name} in ${compileTime}s!`));
            }
        };
        if (compiler.hooks !== void 0) {
            compiler.hooks.compile.tap(pluginName, onStart);
            compiler.hooks.invalid.tap(pluginName, () => this.clear() && onStart());
            compiler.hooks.done.tap(pluginName, onComplete);
        }
        else {
            compiler.plugin('compile', onStart);
            compiler.plugin('invalid', () => this.clear() && onStart());
            compiler.plugin('done', onComplete);
        }
    }
}
exports.default = ComposeMessages;
