import { mockProcessExit } from 'jest-mock-process'

import processFeatures from './process'

jest.mock('tsconfig-paths-webpack-plugin', () => jest.fn(), { virtual: true })
jest.mock('vue-loader/lib/plugin', () => jest.fn(), { virtual: true })

jest.mock('../support/dependencies')

describe('process features', () => {
  const featureConfig = {
    environment: {
      mode: 'production',
    },

    paths: {
      project: {
        src: 'mocked/path',
      },
    },

    webpackConfig: {},
  }

  const mockExit = mockProcessExit()

  test.todo('typescript should return a restart signal'/* , () => {
    // @ts-ignore
    expect(processFeatures({
      features: ['typescript'],

      ...featureConfig,
    })).toBeNull()

    expect(mockExit).toHaveBeenCalledTimes(1)
  }*/)

  test('vue should return a valid webpack configuration', () => {
    // @ts-ignore
    expect(processFeatures({
      features: ['vue'],

      ...featureConfig,
    })).toHaveProperty('resolve.alias.vue$', 'vue/dist/vue.min.js')
  })
})
