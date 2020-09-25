import { getConfigurable } from '../config'
import { DependencyType } from '../types/enums'

import TypeScript from './typescript'

jest.mock('../support/dependencies')

describe('typescript feature', () => {
  let instance: TypeScript

  beforeEach(() => {
    instance = new TypeScript({
      mode: 'development',

      paths: {
        // @ts-expect-error only part of the project object is mocked
        project: {
          src: 'mocked/path',
        },
      },
    })
  })

  test('should have the correct NPM dependencies', () => {
    const dependencies = instance.getFeatureDependencies()

    expect(dependencies).toHaveProperty(DependencyType.DEV, [
      '@babel/preset-typescript@^7.9.0',
      '@typescript-eslint/eslint-plugin@^2.29.0',
      '@typescript-eslint/parser@^2.29.0',
      'tsconfig-paths-webpack-plugin@^3.2.0',
      'ts-loader@^7.0.2',
      'typescript@^3.8.3',
    ])

    expect(dependencies).toHaveProperty(DependencyType.NON_DEV, [])
  })

  test('should set correct arbitrary webpack configuration', () => {
    const MockedTsconfigPathsPlugin = jest.fn()

    jest.mock(
      'tsconfig-paths-webpack-plugin',
      () => MockedTsconfigPathsPlugin,
      { virtual: true }
    )

    // eslint-disable-next-line
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
