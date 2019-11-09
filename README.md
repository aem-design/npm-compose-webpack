<div align="center">

  <img src="./logo.png?raw=true" width="600">

<br>
<br>

[![build][build]][build-url]
[![travis ci][travis]][travis-url]
[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![deps dev][deps-dev]][deps-dev-url]
[![repo size][repo-size]][repo-size-url]
[![last commit][last-commit]][last-commit-url]
[![downloads][downloads]][npm-url]
[![contributors][contributors]][contributors-url]

# @aem-design/compose-webpack

Webpack configuration module to help bootstrap and get AEM projects running fast and efficiently.

</div>

## Table of Contents
- [Background](#background)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [With the CLI](#with-the-cli)
  - [With NPM Scripts](#with-npm-scripts)
- [CLI Options](#cli-options)
- [Configuration](#configuration)
  - [Babel](#babel)
  - [TypeScript](#typescript)
  - [Projects](#projects)
- [Features](#features)
  - [Experimental features](#experimental-features)
- [Browser Support](#browser-support)
- [Todo](#todo)
- [Contributing](#contributing)
- [License](#license)

## Background
Implementing UI behaviour and functionality has been done successfully for a long time now but there is no one solution for AEM. We have taken the time over the past years to find ways of improving our day-to-day workflows. Trying several approaches, we eventually came to the conclusion that other "live reload" solutions didn't fit our needs.

AEM.Design Compose was born with warmth and ❤️.

Our solution is different from the rest simply because we don't using syncing, we don't require clunky solutions such as VLT, and we don't ask that FED's use technology stacks beyond what they know. Simple is best and that is what we give via Webpack & Webpack Dev Server.

## Requirements
- AEM 6.3+
- Node.js 10+
- Yarn _(NPM can be used but version stability isn't guaranteed)_

### Optional
- [aemdesign-aem-compose][aemdesign-compose-url] _(Recommended)_

## Getting Started
First things first, install the module:

```bash
npm install @aem-design/compose-webpack --save-dev

# or with Yarn

yarn add @aem-design/compose-webpack -D
```

## Usage
There are a couple of different ways to run the module service:

### With the CLI
Run from the project directory where your `compose.config.js` file lives:

```bash
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

```bash
npm run build

# or with Yarn

yarn build
```

NPM will automagically reference the binary in `node_modules` for you, and execute the file or command.

## CLI Options
| Argument        | Type           | Default        |
|:----------------|----------------|----------------|
| **--analyzer**<br><sub>_Enable the Bundle Analyzer plugin?_</sub> | `Boolean` | `false` |
| **--clean**<br><sub>_Should the public directory for the specified project be cleaned?_</sub> | `Boolean` | `true` |
| **--config** _&lt;file name&gt;_<br><sub>_Compose configuration file name. You only need to pass a string as the module will resolve it using `process.cwd()`_</sub> | `String` | `compose.config.js` |
| **--dev** _or_ **-d**<br><sub>_Set the build mode to development_</sub> | `Boolean` | `false` |
| **--maven**<br><sub>_Was the task started from within Maven?_</sub> | `Boolean` | `false` |
| **--prod** _or_ **-p**<br><sub>_Set the build mode to production_</sub> | `Boolean` | `false` |
| **--project** _&lt;name&gt;_ _(required)_<br><sub>_Name of the project to build_</sub> | `String` |
| **--watch**<br><sub>_Use webpack-dev-server to proxy AEM and serve changes in real-time_</sub> | `Boolean` | `false` |
| **--help** _or_ **-h**<br><sub>_Show help for the command line options_</sub> |
| **--version** _or_ **-v**<br><sub>_Show the version of `aemdesign-compose`_</sub> |

**NOTE:** _As we use yargs for argument parsing, you can use `--no-<argument>` for booleans to inverse them._

## Configuration
The main goal we want to achieve is a zero-config approach that allows you to get going so you can spend time making awesome things. It wouldn't be a great experience though if you couldn't add your own configuration thus we created `compose.config.js`. What is nice about this is it follows the same conventions of other NPM modules which means you can import additional plugins and such.

We also provide base configuration files for modules such as Babel and TypeScript, you can extend them in your base project and override settings however you choose.

### Babel
```js
module.exports = {
  extends: '@aem-design/compose-webpack/configs/babel.config.js',
}
```

### TypeScript
```json
{
  "extends": "@aem-design/compose-webpack/configs/tsconfig.json"
}
```

### Projects
The heart and soul of our module design is to base configuration on projects rather than Webpack itself. Through lots of prototyping we came up with a simple strucutre that enables you (an amazing FED) to quickly stub out structure without having to touch anything in the core Webpack setup. By default, we provide two projects:

- **core**
- **styleguide**

There is a minor assumption made here that you are using the [aemdesign-aem-compose][aemdesign-compose-url] module which is what our default configuration is based on. It is strongly recommended you use this as a base for your project to remove any ambiguity. An update will be soon coming to `aemdesign-aem-compose` which a complete structure refresh and slimmed down core.

To add custom projects, simply refer to the example configuration below.

**NOTE:** _Custom projects override the defaults, please keep this in mind when setting them._

### Example of **compose.config.js**
```js
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  banner: {
    disable : false,         // Enable/disable the support banner
    font    : 'ANSI Shadow', // ASCII Font type
    text    : 'My Project',  // Text
  },
  
  projects: {
    projectName: {
      outputName: 'myApp',

      // Entry files are relative to the project source, you don't need to define them manually
      entryFile: {
        js   : 'myApp.ts',
        sass : 'myApp.scss',
      },

      // fileMap, additionalEntries
    },
  },

  webpack: {
    rules: [
      {
        loader : 'file-loader',
        test   : /\.(png|jpg|gif|eot|ttf|svg|woff|woff2)$/,
      },
    ],

    cacheGroups: {
      // ...
    },

    plugins: [
      new CopyWebpackPlugin(),
    ],

    // Dev server
    server: {
      host      : 'localhost', // hostaddr to bind 'webpack-dev-server' to
      port      : 1337,        // Port to bind 'webpack-dev-server' to
      proxyHost : 'localhost', // AEM Host - default: localhost
      proxyPort : 4502,        // AEM Port - default: 4502

      // The proxies must conform to the array syntax which only accepts objects based on:
      // https://github.com/chimurai/http-proxy-middleware#options
      proxies: [
        {
          path   : '/hello-world',
          target : 'http://localhost:1337/foo',
        },
      ],
    },
  },
}
```

## Features
Following the zero-config approach we are going for there are a number of things OOTB we do to help the situation that is browser support and modern features.

* Babel 7 (with dynamic imports)
* ES6 support
* TypeScript
* ESLint/Stylelint/TSLint
* Sass (using Dart Sass)
* Vue.js

### Experimental features
* Nullish coalescing ([v8.dev](https://v8.dev/features/nullish-coalescing))
* `async` & `await` ([javascript.info](https://javascript.info/async-await))

## Browser Support
OOTB we provide support for IE11 and all modern browsers (latest 2 releases). Code will be compiled down to ES5 with support for browsers futher back but compatibility may vary for you.

## Todo
- [ ] Create Wiki documentation
- [ ] Add more configuration points
- [ ] Allow the object returned in `compose.config.js` to be a function
- [ ] Opt-in for TypeScript
- [ ] Opt-in for Vue.js

## Contributing
Contributions are welcome! Read the [Contributing Guide](CONTRIBUTING.md) for more information.

## License
[Apache-2.0](./LICENSE)

[aemdesign-compose-url]: https://github.com/aem-design/aemdesign-aem-support/tree/master/aemdesign-aem-compose

[build]: https://github.com/aem-design/npm-compose-webpack/workflows/Build/badge.svg
[build-url]: https://github.com/aem-design/npm-compose-webpack/actions?workflow=Build

[travis]: https://travis-ci.com/aem-design/npm-compose-webpack.svg?branch=develop
[travis-url]: https://travis-ci.com/aem-design/npm-compose-webpack

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
[last-commit-url]: https://github.com/aem-design/npm-compose-webpack/commits

[downloads]: https://img.shields.io/npm/dm/@aem-design/compose-webpack.svg

[contributors]: https://img.shields.io/github/contributors/aem-design/npm-compose-webpack.svg
[contributors-url]: https://github.com/aem-design/npm-compose-webpack/graphs/contributors
