import path from 'path'
import mockConsole from 'jest-mock-console'
import pify from 'pify'
import MemoryFS from 'memory-fs'
import webpack from 'webpack'

import runtime from '@/runtime'

declare module 'webpack' {
  class Compiler {
    run(): Promise<any>;
  }
}

jest.mock('@aem-design/compose-support', () => ({
  logger: {
    info: jest.fn(),
  },
}))

describe('runtime', () => {
  let memoryFileSystem: MemoryFS

  beforeEach(() => {
    memoryFileSystem = new MemoryFS
  })

  test('can compile es6 javascript entry', (done) => {
    const restoreConsoleMock = mockConsole()

    const compiler = webpack(runtime(
      {
        standard: {
          projects: {
            mock: {
              entryFile  : 'basic-es6.js',
              outputName : 'mock',
            },
          },
        },

        webpack: {
          context: path.resolve(__dirname, 'fixtures'),
        },
      },
      {
        prod    : true,
        project : 'mock',
      },
    )())

    // @ts-expect-error known that the webpack type and 'memory-fs' aren't compatible
    compiler.outputFileSystem = memoryFileSystem
    compiler.run = pify(compiler.run.bind(compiler))

    compiler.run()
      .then(() => {
        console.log(memoryFileSystem.statSync('.'))

        restoreConsoleMock()
        done()
      })
      .catch(() => {
        restoreConsoleMock()
        done()
      })
  })
})
