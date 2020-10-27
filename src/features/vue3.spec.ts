import webpack from 'webpack'

import { getConfigurable } from '@/config'
import { DependencyType } from '@/types/enums'

import Vue from '@/features/vue'

jest.mock('../support/dependencies')

let instance: Vue

describe('default config', () => {
  beforeEach(() => {
    instance = new Vue({
      mode: 'development',

      paths: {
        // @ts-expect-error only part of the project object is mocked
        project: {
          src: 'mocked/path',
        },
      },
    }, {
      version: 3,
    })
  })

  test('should have the correct NPM dependencies', () => {
    const dependencies = instance.getFeatureDependencies()

    expect(dependencies).toHaveProperty(DependencyType.DEV, [
      '@vue/cli-plugin-babel@^4.5.7',
      '@vue/cli-plugin-eslint@^4.5.7',
      '@vue/eslint-config-typescript@^7.0.0',
      'babel-preset-vue@^2.0.2',
      'vue-style-loader@^4.1.2',
      'vue-loader@^v16.0.0-beta.8',
      '@vue/compiler-sfc',
    ])

    expect(dependencies).toHaveProperty(DependencyType.NON_DEV, [
      'vue@^3.0.0',
    ])
  })

  test('should return the ESM Vue.js distribution file', () => {
    expect(instance.aliases()).toHaveProperty('vue$', 'vue/dist/vue.esm-bundler.js')
  })

  test('should set correct arbitrary webpack configuration', () => {
    expect(instance.arbitraryUpdates())
      .toHaveProperty('optimization.splitChunks.cacheGroups.vue.name', 'vue')

    expect(getConfigurable('assetFilters')).toContainEqual('vue')
  })

  test('should set correct webpack plugins configuration', () => {
    const MockedVueLoaderPlugin = {
      VueLoaderPlugin: jest.fn(),
    }

    jest.mock('vue-loader', () => MockedVueLoaderPlugin, { virtual: true })

    const plugins = instance.plugins()

    expect(MockedVueLoaderPlugin.VueLoaderPlugin).toHaveBeenCalledTimes(1)

    expect(plugins[0]).toBeInstanceOf(MockedVueLoaderPlugin.VueLoaderPlugin)

    expect(plugins[1]).toBeInstanceOf(webpack.DefinePlugin)
  })

  test('should return the correct webpack rules', () => {
    const rules = instance.rules()

    expect(getConfigurable('moduleRules')[0].loader).toStrictEqual('vue-loader')

    expect(rules).toHaveProperty([0, 'use', 0, 'loader'], 'vue-style-loader')
    expect(rules).toHaveProperty([0, 'use', 2, 'loader'], 'postcss-loader')
    expect(rules).toHaveProperty([0, 'use', 3, 'options', 'sassOptions', 'outputStyle'], 'expanded')
  })
})

describe('runtime only', () => {
  beforeEach(() => {
    instance = new Vue({
      mode: 'production',

      paths: {
        // @ts-expect-error only part of the project object is mocked
        project: {
          src: 'mocked/path',
        },
      },
    }, {
      runtimeOnly : true,
      version     : 3,
    })
  })

  test('should return the ESM Vue.js distribution file', () => {
    expect(instance.aliases()).toHaveProperty('vue$', 'vue/dist/vue.runtime.esm-bundler.js')
  })
})
