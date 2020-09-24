import { defaultProjects as projects } from './defaults'

describe('defaults', () => {
  test('should have the correct output name for core', () => {
    expect(projects.core.outputName).toEqual('app')
  })

  test('should have the correct output name for styleguide', () => {
    expect(projects.styleguide.outputName).toEqual('styleguide')
  })
})
