---
layout: default
title: Welcome
nav_order: 1
description: "A near zero-config solution to have a modern front end developer workflow for AEM"
permalink: /
---

Work in progress
{: .label .label-yellow }

<a class="" href="https://github.com/aem-design/npm-compose-webpack/actions?workflow=Build" target="_blank" rel="nofollow">
  <img src="https://github.com/aem-design/npm-compose-webpack/workflows/Build/badge.svg">
</a>
<a class="" href="https://travis-ci.com/aem-design/npm-compose-webpack" target="_blank" rel="nofollow">
  <img src="https://travis-ci.com/aem-design/npm-compose-webpack.svg?branch=develop">
</a>
<a class="" href="https://npmjs.com/package/@aem-design/compose-webpack" target="_blank" rel="nofollow">
  <img src="https://img.shields.io/npm/v/@aem-design/compose-webpack.svg">
</a>
<a class="" href="https://github.com/aem-design/npm-compose-webpack/commits" target="_blank" rel="nofollow">
  <img src="https://img.shields.io/github/last-commit/aem-design/npm-compose-webpack">
</a>

# AEM.Design Compose for webpack
{: .fs-8 }

Implementing UI behaviour and functionality has been done successfully for a long time now but there is no one solution for AEM. We have taken the time over the past years to find ways of improving our day-to-day workflows. Trying several approaches, we eventually came to the conclusion that other "live reload" solutions didn't fit our needs.

AEM.Design Compose was born with warmth and ❤️.

Our solution is different from the rest simply because we don't using syncing, we don't require clunky solutions such as VLT, and we don't ask that FED's use technology stacks beyond what they know. Simple is best and that is what we give via [webpack](https://webpack.js.org/) & [webpack-dev-server](https://webpack.js.org/configuration/dev-server/).

[Get started now](#getting-started){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View it on GitHub](https://github.com/aem-design/npm-compose-webpack){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## Getting started
It is not a requirement to be using [aemdesign-aem-compose](https://github.com/aem-design/aemdesign-aem-support/tree/master/aemdesign-aem-compose) but it is highly recommended you use the same structure to prevent any errors that may arise due to inconsistent pathing.

### Requirements
- AEM 6.3+
- Node.js 10+
- Yarn (NPM can be used but version stability isn't guaranteed)

#### Optional
- [aemdesign-aem-compose](https://github.com/aem-design/aemdesign-aem-support/tree/master/aemdesign-aem-compose) (Recommended)

### Installation
Add the `@aem-design/compose-webpack` package to your project.

#### via NPM
```bash
npm install @aem-design/compose-webpack --save-dev
```

#### via Yarn
```bash
yarn add @aem-design/compose-webpack -D
```

### Add an NPM scripts for ease-of-use.
```json
"scripts": {
  "build": "aemdesign-compose -p --project=core",
  "build.dev": "aemdesign-compose -d --project=core",
  "serve": "aemdesign-compose -d --watch --project=core"
}
```

### Run it!

#### via NPM
```bash
npm run build
```

#### via Yarn
```bash
yarn build
```

### Configuration
[See configuration](/configuration) page for more information.

---

## About the project
@aem-design/compose-webpack is &copy; 2020 by AEM.Design.

### License
@aem-design/compose-webpack is distributed by an [Apache-2.0](https://github.com/aem-design/npm-compose-webpack/tree/master/LICENSE).

### Contributing
When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change. Read more about becoming a contributor in [our GitHub repo](https://github.com/aem-design/npm-compose-webpack/tree/master/CONTRIBUTING.md).

### Code of Conduct
@aem-design/compose-webpack is committed to fostering a welcoming community.

[View our Code of Conduct](https://github.com/aem-design/npm-compose-webpack/tree/master/CODE_OF_CONDUCT.md) on our GitHub repository.
