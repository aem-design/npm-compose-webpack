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

| Argument        | Type           | Default Value  |
|:----------------|:---------------|:---------------|
| `--analyzer`<br><small>Enable the Bundle Analyzer plugin?</small> | `Boolean` | `false` |
| `--clean`<br><small>Should the public directory for the specified project be cleaned?</small> | `Boolean` | `true` |
| `--config` _&lt;file name&gt;_<br><small>Compose configuration file name</small> | `String` | `compose.config.js` |
| `--dev` _or_ `-d`<br><small>Set the build mode to development</small> | `Boolean` | `false` |
| `--eslint`<br><small>Toggle ESLint for JavaScript files</small> | `Boolean` | `true` |
| `--maven`<br><small>Was the task started from within Maven?</small> | `Boolean` | `false` |
| `--prod` _or_ `-p`<br><small>Set the build mode to production</small> | `Boolean` | `false` |
| `--project` _&lt;name&gt;_ _(required)_<br><small>Name of the project to build</small> | `String` |
| `--stylelint`<br><small>Toggle Stylelint for Sass and CSS files</small> | `Boolean` | `true` |
| `--watch`<br><small>Use webpack-dev-server to proxy AEM and serve changes in real-time</small> | `Boolean` | `false` |
| `--help` _or_ `-h`<br><small>Show help for the command line options</small> |
| `--version` _or_ `-v`<br><small>Show the version of **aemdesign-compose** binary</small> |
