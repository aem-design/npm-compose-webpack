import { getConfigurable } from '../config'
import { DependencyType } from '../types/enums'

import Vue from './vue'

jest.mock('../support/dependencies')

describe('vue feature', () => {
  let instance: Vue

  beforeEach(() => {
    // @ts-ignore
    instance = new Vue({
      mode: 'development',

      paths: {
        // @ts-ignore
        project: {
          src: 'mocked/path',
        },
      },
    })
  })

  test('should have the correct NPM dependencies', () => {
    const dependencies = instance.getFeatureDependencies()

    expect(dependencies).toHaveProperty(DependencyType.DEV, [
      '@vue/cli-plugin-babel@^4.3.1',
      '@vue/cli-plugin-eslint@^4.3.1',
      '@vue/compiler-sfc@^3.0.0',
      '@vue/eslint-config-typescript@^5.0.2',
      'babel-preset-vue@^2.0.2',
      'vue-loader@^v16.0.0-beta.8',
      'vue-style-loader@^4.1.2',
      'vue-template-compiler@^2.6.11',
    ])

    expect(dependencies).toHaveProperty(DependencyType.NON_DEV, [
      'vue@^2.6.11',
      'vue-property-decorator@^8.4.2',
    ])
  })

  test('should return the ESM Vue.js distribution file', () => {
    expect(instance.aliases()).toHaveProperty('vue$', 'vue/dist/vue.esm.js')
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
  })

  test('should return the correct webpack rules', () => {
    const rules = instance.rules()

    expect(rules).toHaveProperty([0, 'loader'], 'vue-loader')
    expect(rules).toHaveProperty([1, 'use', 0, 'loader'], 'vue-style-loader')
    expect(rules).toHaveProperty([1, 'use', 2, 'loader'], 'postcss-loader')
    expect(rules).toHaveProperty([1, 'use', 3, 'options', 'sassOptions', 'outputStyle'], 'expanded')
  })
})
