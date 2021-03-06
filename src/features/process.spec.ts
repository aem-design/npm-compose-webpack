import mockConsole, { RestoreConsole } from 'jest-mock-console'
import { mockProcessExit } from 'jest-mock-process'

import processFeatures from '@/features/process'

jest.mock('child_process')

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

  let restoreConsoleMock: RestoreConsole

  beforeAll(() => {
    restoreConsoleMock = mockConsole()
  })

  test('typescript should return a restart signal', () => {
    const mockExit = mockProcessExit()

    // @ts-expect-error part of the configuration is omitted on purpose as it isn't required
    expect(processFeatures({
      features: {
        typescript: true,
      },

      ...featureConfig,
    })).toBeNull()

    expect(mockExit).toHaveBeenCalledTimes(1)
  })

  test('typescript should return a missing dependency', () => {
    const mockExit = mockProcessExit()

    // @ts-expect-error several other properties are missing for 'env'
    expect(processFeatures({
      features: {
        typescript: true,
      },

      ...featureConfig,
    })).toBeNull()

    expect(mockExit).toHaveBeenCalledTimes(1)
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  test('vue should return a valid webpack configuration', () => {
    jest.mock('vue-loader', () => ({
      VueLoaderPlugin: jest.fn(),
    }), { virtual: true })

    // @ts-expect-error several other properties are missing for 'env'
    expect(processFeatures({
      features: {
        vue: true,
      },

      ...featureConfig,
    })).toHaveProperty('resolve.alias.vue$', 'vue/dist/vue.esm.js')
  })

  test('consecutive features correct set restart status', () => {
    const mockExit = mockProcessExit()

    jest.unmock('vue-loader')

    // @ts-expect-error several other properties are missing for 'env'
    expect(processFeatures({
      features: {
        bootstrap  : true,
        typescript : true,
        vue        : true,
      },

      ...featureConfig,
    })).toBeNull()

    expect(mockExit).toHaveBeenCalledTimes(1)
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  afterAll(() => {
    restoreConsoleMock()

    jest.resetAllMocks()
  })
})
