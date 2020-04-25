import mockConsole from 'jest-mock-console'
import { mockProcessExit } from 'jest-mock-process'

import processFeatures from './process'

jest.mock('@aem-design/compose-support', () => ({
  logger: {
    error : jest.fn(),
    info  : jest.fn(),
  },
}))

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

  let restoreConsoleMock

  beforeAll(() => {
    restoreConsoleMock = mockConsole()
  })

  afterAll(() => {
    restoreConsoleMock()
  })

  test('typescript should return a restart signal', () => {
    jest.mock('tsconfig-paths-webpack-plugin', () => jest.fn(), { virtual: true })

    const mockExit = mockProcessExit()

    // @ts-ignore
    expect(processFeatures({
      features: ['typescript'],

      ...featureConfig,
    })).toBeNull()

    expect(mockExit).toHaveBeenCalledTimes(1)
  })

  test('typescript should return a missing dependency', () => {
    jest.unmock('tsconfig-paths-webpack-plugin')

    const mockExit = mockProcessExit()

    // @ts-ignore
    expect(processFeatures({
      features: ['typescript'],

      ...featureConfig,
    })).toBeNull()

    expect(mockExit).toHaveBeenCalledTimes(1)
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  test('vue should return a valid webpack configuration', () => {
    jest.mock('vue-loader/lib/plugin', () => jest.fn(), { virtual: true })

    // @ts-ignore
    expect(processFeatures({
      features: ['vue'],

      ...featureConfig,
    })).toHaveProperty('resolve.alias.vue$', 'vue/dist/vue.min.js')
  })
})
