---
layout: default
title: Extended Configurations
nav_order: 2
parent: Configuration - v1.x
grand_parent: v1.x
description: "Extend the compose configurations provided for a zero-config solution"
permalink: /previous-releases/v1/configuration/extended-configs
has_toc: false
search_exclude: true
---

# Extended Configurations
{: .no_toc }

We provide base configuration files for modules such as Babel and TypeScript. You can extend them in your base project and override settings however you choose.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Babel
{: .fs-5 }

.babelrc.js
{: .text-delta }

```js
module.exports = {
  extends: '@aem-design/compose-webpack/configs/babel.config.js',
}
```

.babelrc
{: .text-delta }

```json
{
  "extends": "@aem-design/compose-webpack/configs/babel.config.js"
}
```

---

## TypeScript
{: .fs-5 }

tsconfig.json
{: .text-delta }

```json
{
  "extends": "@aem-design/compose-webpack/configs/tsconfig.json"
}
```

---

We are hoping to add more configurations in the future for things like Stylelint and ESLint. Stay tuned!
