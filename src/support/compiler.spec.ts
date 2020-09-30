import webpack from 'webpack'

import {
  getWebpackCompiler,
  registerWebpackCompiler,
} from './compiler'

describe('compiler', () => {
  const compiler = webpack({})

  beforeAll(() => {
    registerWebpackCompiler(compiler)
  })

  test('can get registered webpack compiler', () => {
    expect(getWebpackCompiler()).toMatchObject(compiler)
  })

  test('can register a new webpack compiler', () => {
    const newCompiler = webpack({})

    registerWebpackCompiler(newCompiler)

    expect(getWebpackCompiler()).toMatchObject(newCompiler)
    expect(getWebpackCompiler()).not.toMatchObject(compiler)
  })
})
