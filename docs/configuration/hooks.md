---
layout: default
title: Hooks
nav_order: 3
parent: Configuration
description: "Learn how to register hooks that allow you to complete tasks at different lifecycle stages"
permalink: /configuration/hooks
has_toc: false
---

# Hooks
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

Sometimes you may need to run a script at a specific point in the build lifecycle which can be tricky with standard webpack configurations. To assist with these use cases, we provide an API that allows you to register hooks in a number of lifecycle stages.

## Available Hooks
The following hooks are available:

- init:post
- init:pre

In addition, you are also able to define how your hook is executed by using `before` & `after` callback functions or just one at one time.

## Example
```js
registerHook('init:pre', {
  before() {
    // Run arbitrary code before the pre-initialisation...
  },

  after() {
    // Run arbitrary code after the pre-initialisation...
  },
})
```

## Callback parameters
Not all callbacks are equal due to the point in which they exist in the lifecycle. `env` is passed to each callback function but the structure does vary so please ensure your script takes this into account.

## Asynchronous Execution
As the callbacks are just JavaScript you can use `async`/`await` as they are natively supported in Node.js 10+.

```js
registerHook('init:pre', {
  before: async () => {
    const response = await fetch('https://webpack.aem.design')
  },
})
```
