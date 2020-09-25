import { DependencyType } from '../types/enums'

import { constructCommand } from './dependencies'

describe('dependencies - yarn', () => {
  test('yarn add command should be generated for non dev dependencies', () => {
    expect(constructCommand(['yo'], DependencyType.NON_DEV)).toEqual('yarn add yo')
  })

  test('yarn add command should be generated for dev dependencies', () => {
    expect(constructCommand(['yo'], DependencyType.DEV)).toEqual('yarn add yo -D')
  })

  test('version constraint is honoured in the install command', () => {
    expect(constructCommand(['yo@1.0.0'], DependencyType.DEV)).toEqual('yarn add yo@1.0.0 -D')
  })
})
