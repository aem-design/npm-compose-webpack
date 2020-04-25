import { DependencyType } from '../types/enums'

import { constructCommand } from './dependencies'

describe('dependencies', () => {
  test('yarn add command should be generated for non dev dependencies', () => {
    expect(constructCommand(['yo'], DependencyType.NON_DEV)).toEqual('yarn add yo')
  })

  test('yarn add command should be generated for dev dependencies', () => {
    expect(constructCommand(['yo'], DependencyType.DEV)).toEqual('yarn add yo -D')
  })
})
