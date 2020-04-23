import { getConfigurable } from '../config'
import { DependencyType } from '../types/enums'

import Vue from './vue'

jest.mock('../support/dependencies')

const MockedVueLoaderPlugin = jest.fn()
jest.mock('vue-loader/lib/plugin', () => MockedVueLoaderPlugin, { virtual: true })

describe('vue feature', () => {
  let instance: Vue

  beforeEach(() => {
    MockedVueLoaderPlugin.mockClear()

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
      'vue-loader',
      'vue-style-loader',
      'vue-template-compiler',
    ])

    expect(dependencies).toHaveProperty(DependencyType.NON_DEV, [
      'vue-property-decorator',
      'vue',
    ])
  })

  test('should return the ESM Vue.js distribution file', () => {
    expect(instance.aliases()).toHaveProperty('vue$', 'vue/dist/vue.esm.js')
  })

  test('should set correct arbitrary webpack configuration', () => {
    expect(instance.arbitraryUpdates()).toHaveProperty('optimization.splitChunks.cacheGroups.vue.name', 'vue')

    expect(getConfigurable('assetFilters')).toContainEqual('vue')
  })

  test('should set correct webpack plugins configuration', () => {
    const plugins = instance.plugins()

    expect(MockedVueLoaderPlugin).toHaveBeenCalledTimes(1)

    expect(plugins[0]).toBeInstanceOf(MockedVueLoaderPlugin)
  })

  test('should return the correct webpack rules', () => {
    const rules = instance.rules()

    expect(rules).toHaveProperty([0, 'loader'], 'vue-loader')
    expect(rules).toHaveProperty([1, 'use', 0, 'loader'], 'vue-style-loader')
    expect(rules).toHaveProperty([1, 'use', 2, 'loader'], 'postcss-loader')
    expect(rules).toHaveProperty([1, 'use', 3, 'options', 'sassOptions', 'outputStyle'], 'expanded')
  })
})
