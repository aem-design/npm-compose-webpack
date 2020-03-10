---
layout: default
title: Configuration
has_children: true
nav_order: 2
description: "How to configure the @aem-design/compose-webpack package"
permalink: /configuration
has_toc: false
---

# Configuration
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Command Line Options
See [command line options](/configuration/cli) for more information.

## Compose Configuration File
There really wouldn't be much point to any package if you couldn't configure it the way you need to. As of `v2.x`, there are more ways to customise your experience. Here's a few:

1. Opt-in for features like Vue.js
2. Almost full access to the webpack configuration
3. Hooks
4. and more...

To get started, create a **compose.config.js** file in the root of your front end project and continue reading below.

### Basic Configuration
The easiest change you may want to make is adding an additional plugin.

```js
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  webpack: {
    plugins: [
      new CopyWebpackPlugin(),
    ],
  },
}
```

There wouldn't be much point if all you could configure is just webpack, you can also change the default banner and projects too.

```js
module.exports = {
  standard: {
    banner: {
      disable : false,         // Enable/disable the support banner
      font    : 'ANSI Shadow', // ASCII Font type
      text    : 'My Project',  // Text
    },

    projects: {
      projectName: {
        entryFile  : 'myProject.ts',
        outputName : 'myProject',
      },
    },
  },
}
```

---

### Advanced Configuration
There are times when you need access to the environment values for webpack in order to generate different output for **development** & **production**. You can do this by passing a function to the `webpack` configuration instead of an object.

```js
module.exports = {
  webpack(env) {
    console.log(env.project)
    
    return { /* configuration here */ }
  },
}
```

You will have access to the following values:

```
{
  analyzer: boolean;
  clean: boolean;
  eslint: boolean;
  hmr: boolean;
  maven: boolean;
  mode: 'development' | 'production';
  project: string;
  stylelint: boolean;
  watch: boolean;

  paths: {
    aem: string;
    out: string | boolean; // `false` when using --watch
    src: string;

    project: {
      public: string;
      src: string;
    };
  };
}
```

### Intellisense
Recommended
{: .label .label-green }

For improved intellisense, you can also use the built-in `configuration` helper function which will enable first-class TypeScript support. All you need to make this work is an IDE that is TypeScript enabled and everything will work like magic.

```js
const { configuration } = require('@aem-design/compose-webpack')

module.exports = configuration({
  // normal configuration here...
})
```

### Dynamic Configurations
In addition to been able to use a function for the webpack configuration, there are helper functions that allow that enable you to create dynamic configurations without needing to expose our entire API. There are many cases by which you may need to only execute a plugin for a particular environment, under the hood we extend `webpack-config-utils` which allow you to do some cool things.

```js
const CopyWebpackPlugin = require('copy-webpack-plugin')

const { configuration, ifUtil } = require('@aem-design/compose-webpack')

module.exports = configuration({
  webpack() {
    console.log(ifUtil().ifProd('PROD', 'DEV'))

    return {
      plugins: [
        ifUtil().ifDev(new CopyWebpackPlugin()),
      ],
    }
  },
})
```
