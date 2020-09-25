import webpack from 'webpack'

import { DependencyType } from '../types/enums'

import Bootstrap from './bootstrap'

jest.mock('../support/dependencies')

describe('bootstrap feature', () => {
  let instance: Bootstrap

  beforeEach(() => {
    // @ts-expect-error feature constructors expect an env object
    instance = new Bootstrap()
  })

  test('should have the correct NPM dependencies', () => {
    const dependencies = instance.getFeatureDependencies()

    expect(dependencies).toHaveProperty(DependencyType.DEV, [
      'exports-loader@^0.7.0',
    ])

    expect(dependencies).toHaveProperty(DependencyType.NON_DEV, [
      'bootstrap@^4.5.0',
      'jquery@^3.5.1',
      'popper.js@^1.16.1',
    ])
  })

  test('should have definitions provided for mapping Bootstrap modules', () => {
    const plugins = instance.plugins()

    expect(plugins).toHaveLength(1)

    expect(plugins[0]).toBeInstanceOf(webpack.ProvidePlugin)

    expect(plugins[0]).toHaveProperty(['definitions', 'Alert'], 'exports-loader?exports=Alert!bootstrap/js/dist/alert')
  })
})
