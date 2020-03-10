---
layout: default
title: Command Line Options
nav_order: 1
parent: Configuration
description: "Command line options for the aemdesign-compose binary"
permalink: /configuration/cli
has_toc: false
---

# Command Line Options
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

Being able to toggle things on/off is important in any application and we have baked in some useful ones to get up and running as-fast-as-possible.

[yargs](http://yargs.js.org/) is used under the hood so you can do cool things like `--no-eslint` for example which will invert the boolean value to `false` instead of `true`.

---

### Bundle Analyzer
Visualize size of webpack output files with an interactive zoomable treemap.

| Argument                 | Type           | Default Value       |
|:-------------------------|:---------------|:--------------------|
| `--analyzer`             | `Boolean`      | `false`             |

See: [github.com](https://github.com/webpack-contrib/webpack-bundle-analyzer)
{: .text-delta }

---

### Clean
Should the public directory for the specified project be cleaned?

| Argument                 | Type           | Default Value       |
|:-------------------------|:---------------|:--------------------|
| `--clean`                | `Boolean`      | `true`              |

---

### Config
File name for the compose configuration.

| Argument                 | Type           | Default Value       |
|:-------------------------|:---------------|:--------------------|
| `--config <file name>`   | `String`       | `compose.config.js` |

---

### ESLint Validation
New
{: .label .label-purple }

Runs JavaScript validation against the input source (`src/<project>/js`) using your `.eslintrc` file.

| Argument                 | Type           | Default Value       |
|:-------------------------|:---------------|:--------------------|
| `--eslint`               | `Boolean`      | `true`              |

See: [github.com](https://github.com/webpack-contrib/eslint-webpack-plugin/)
{: .text-delta }

---

### Maven
When enabled, some internal cogs are switched so certain things don't happen as they would when running a regular build.

| Argument                 | Type           | Default Value       |
|:-------------------------|:---------------|:--------------------|
| `--maven`                | `Boolean`      | `false`             |

---

### Mode: Development
Run the build in development mode.

| Argument                 | Type           | Default Value       |
|:-------------------------|:---------------|:--------------------|
| `--dev` _or_ `-d`        | `Boolean`      | `false`             |

**NOTE:** Running this flag along with the production flag will yield unexpected results.
{: .text-zeta }

---

### Mode: Production
Run the build in production mode.

| Argument                 | Type           | Default Value       |
|:-------------------------|:---------------|:--------------------|
| `--prod` _or_ `-p`       | `Boolean`      | `false`             |

**NOTE:** Running this flag along with the development flag will yield unexpected results.
{: .text-zeta }

---

### Project
Required
{: .label .label-red }

Define which project you would like to build.

| Argument                 | Type           | Default Value       |
|:-------------------------|:---------------|:--------------------|
| `--project`              | `String`       |                     |

---

### Stylelint Validation
New
{: .label .label-purple }

Runs Sass/CSS validation against the input source (`src/<project>/scss`) using your `.stylelintrc` file.

| Argument                 | Type           | Default Value       |
|:-------------------------|:---------------|:--------------------|
| `--stylelint`            | `Boolean`      | `true`              |

See: [github.com](https://github.com/webpack-contrib/stylelint-webpack-plugin/)
{: .text-delta }

---

### Watch (Dev Server)
Enable the `webpack-dev-server` as a proxy between your local source code and AEM.

| Argument                 | Type           | Default Value       |
|:-------------------------|:---------------|:--------------------|
| `--watch`                | `Boolean`      | `false`             |

See: [webpack.js.org](https://webpack.js.org/configuration/dev-server/)
{: .text-delta }

---

## Other Commands

| Argument                 | Description                                              | 
|:-------------------------|:---------------------------------------------------------|
| `--help` _or_ `-h`       | Show help for the command line options                   |
| `--version` _or_ `-v`    | Show the version of **aemdesign-compose** binary         |
