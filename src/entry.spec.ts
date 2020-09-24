import { resolve } from 'path'

import {
  setupEnvironment,
  setProjects,
} from './config'

import EntryConfiguration from './entry'

describe('entry', () => {
  beforeAll(() => {
    setupEnvironment({
      project: 'core',
    })

    setProjects(null)
  })

  test('should create the correct entry configuration', () => {
    expect(EntryConfiguration(false)).toHaveProperty('app', './core/js/app.ts')
  })

  test('should create the correct HMR entry configuration', () => {
    const entry = EntryConfiguration(true)

    const cssSupportFilePath = resolve(__dirname, '../support/empty.css')

    expect(entry).toHaveProperty(['clientlibs-footer', 0], './core/js/app.ts')

    expect(entry).toHaveProperty(['clientlibs-header', 0], cssSupportFilePath)
  })
})
