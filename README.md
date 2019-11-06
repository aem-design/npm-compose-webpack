# AEM.Design Compose Webpack

[build]: https://github.com/aem-design/npm-compose-webpack/workflows/Build/badge.svg
[build-url]: https://github.com/aem-design/npm-compose-webpack/actions?workflow=Build
[npm]: https://img.shields.io/npm/v/@aem-design/compose-webpack.svg
[npm-url]: https://npmjs.com/package/@aem-design/compose-webpack
[node]: https://img.shields.io/node/v/@aem-design/compose-webpack.svg
[node-url]: https://nodejs.org
[deps]: https://david-dm.org/aem-design/npm-compose-webpack.svg
[deps-url]: https://david-dm.org/aem-design/npm-compose-webpack
[deps-dev]: https://david-dm.org/aem-design/npm-compose-webpack/dev-status.svg
[deps-dev-url]: https://david-dm.org/aem-design/npm-compose-webpack?type=dev
[repo-size]: https://img.shields.io/github/repo-size/aem-design/npm-compose-webpack
[repo-size-url]: https://github.com/aem-design/npm-compose-webpack
[last-commit]: https://img.shields.io/github/last-commit/aem-design/npm-compose-webpack
[last-commit-url]: https://github.com/aem-design/npm-compose-webpack
[downloads]: https://img.shields.io/npm/dm/@aem-design/compose-webpack.svg
[contributors]: https://img.shields.io/github/contributors/aem-design/npm-compose-webpack.svg
[contributors-url]: https://github.com/aem-design/npm-compose-webpack/graphs/contributors

[![build][build]][build-url]
[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![deps dev][deps-dev]][deps-dev-url]
[![repo size][repo-size]][repo-size-url]
[![last commit][last-commit]][last-commit-url]
[![downloads][downloads]][npm-url]
[![contributors][contributors]][contributors-url]

Webpack configuration module to help bootstrap and get AEM projects running fast and efficiently.

## Table of Contents
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [With the CLI](#with-the-cli)
  - [With NPM Scripts](#with-npm-scripts)
- [Options](#support)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

## Getting Started
First things first, install the module:

```console
npm install @aem-design/compose-webpack --save-dev

# or with Yarn

yarn add @aem-design/compose-webpack -D
```

## Usage
There are a couple of different ways to run the module service:

### With the CLI
Run from the project directory where your `compose.config.js` file lives:

```console
node_modules/.bin/aemdesign-compose

# or using some NPM magic

$(npm bin)/aemdesign-compose
```

**Note**: _The CLI service has a number of options available, please see the [Options](#options) below._

### With NPM Scripts
Convenience is a nice thing though and NPM scripts provide a much cleaner and easier way of defining access to the service. The best part of scripts is they automatically resolve the path to NPM binaries so you don't need to know where it lives. Define it and off you go:

```json
"scripts": {
  "build": "aemdesign-compose"
}
```

And run the following in your terminal/console:

```console
npm run build

# or with Yarn

yarn build
```

NPM will automagically reference the binary in `node_modules` for you, and execute the file or command.

## Options
<div class="options">

| Argument | Type | Default |
| ---      | ---  | --- |
| **--analyzer**<br>_Enable the Bundle Analyzer plugin?_ | `Boolean` | `false` |
| **--clean**<br>_Should the public directory for the specified project be cleaned?_ | `Boolean` | `true` |
| **--config** _&lt;file name&gt;_<br>_Compose configuration file name. You only need to pass a string as the module will resolve it using `process.cwd()`_ | `String` | `compose.config.js` |
| **--dev** _or_ **-d**<br>_Set the build mode to development_ | `Boolean` | `false` |
| **--maven**<br>_Was the task started from within Maven?_ | `Boolean` | `false` |
| **--prod** _or_ **-p**<br>_Set the build mode to production_ | `Boolean` | `false` |
| **--project** _(required)_<br>_Name of the project to build_ | `String` |
| **--watch**<br>_Use webpack-dev-server to proxy AEM and serve changes in real-time_ | `Boolean` | `false` |
| **--help** _or_ **-h**<br>_Show help for the command line options_ |
| **--version** _or_ **-v**<br>_Show the version of `aemdesign-compose`_ |

</div>

<style>
  .options th:first-of-type {
    max-width: 400px;
  }
  .options th:nth-of-type(2) {
    min-width: 80px;
  }
  .options th:nth-of-type(3) {
    min-width: 140px;
  }
</style>

**NOTE:** _As we use yargs for argument parsing, you can use `--no-<argument>` for booleans to inverse them._

## Browser Support
OOTB we provide support for IE11 and all modern browsers (latest 2 releases). Code will be compiled down to ES5 with support for browsers futher back but compatibility may vary for you.

## Contributing
A contribution guide will be coming soon, we won't bite if you open a PR.

## License

#### [Apache-2.0](./LICENSE)
