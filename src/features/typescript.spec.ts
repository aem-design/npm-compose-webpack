import { getConfigurable } from '../config'
import { DependencyType } from '../types/enums'

import TypeScript from './typescript'

jest.mock('../support/dependencies')

const MockedTsconfigPathsPlugin = jest.fn()
jest.mock('tsconfig-paths-webpack-plugin', () => MockedTsconfigPathsPlugin, { virtual: true })

describe('typescript feature', () => {
  let instance: TypeScript

  beforeEach(() => {
    MockedTsconfigPathsPlugin.mockClear()

    // @ts-ignore
    instance = new TypeScript({
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
      'tsconfig-paths-webpack-plugin',
      'ts-loader',
      'typescript',
    ])

    expect(dependencies).toHaveProperty(DependencyType.NON_DEV, [])
  })

  test('should set correct arbitrary webpack configuration', () => {
    const arbitraryChanges = instance.arbitraryUpdates()

    expect(MockedTsconfigPathsPlugin).toHaveBeenCalledTimes(1)

    expect(arbitraryChanges?.resolve?.plugins?.[0]).toBeInstanceOf(MockedTsconfigPathsPlugin)

    expect(getConfigurable('resolveExtensions')).toContain('.ts')
  })

  test('should return the correct webpack rules', () => {
    const rules = instance.rules()

    expect(rules).toHaveProperty([0, 'use', 0, 'loader'], 'babel-loader')
    expect(rules).toHaveProperty([0, 'use', 1, 'loader'], 'ts-loader')
  })
})
