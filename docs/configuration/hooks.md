---
layout: default
title: Hooks
nav_order: 3
parent: Configuration
description: "Learn how to register hooks that allow you to complete tasks at different lifecycle stages"
permalink: /configuration/hooks
has_toc: false
---

Subject to change
{: .label .label-yellow }

# Hooks
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

Sometimes you may need to run a script at a specific point in the build lifecycle which can be tricky with standard webpack configurations. To assist with these use cases, we provide an API that allows you to register hooks in 4 separate lifecycle locations.

## Pre-initialisation
Occurs before any webpack configuration is executed.
