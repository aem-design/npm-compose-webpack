import { DependencyType } from '../types/enums'

import Feature from './feature'

describe('base feature', () => {
  let instance: Feature

  beforeEach(() => {
    // @ts-ignore
    instance = new Feature({
      mode: 'development',
    })
  })

  test('should have no NPM dependencies', () => {
    const dependencies = instance.getFeatureDependencies()

    expect(dependencies).toHaveProperty(DependencyType.DEV, [])
    expect(dependencies).toHaveProperty(DependencyType.NON_DEV, [])
  })

  test('should return a blank webpack configuration', () => {
    expect(instance.defineWebpackConfiguration()).toHaveProperty('plugins', [])
  })
})
