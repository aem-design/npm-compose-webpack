import path from 'path'
import mockConsole, { RestoreConsole } from 'jest-mock-console'
import mockFS from 'mock-fs'
import { createFsFromVolume, IFs, Volume } from 'memfs'
import webpack from 'webpack'

import runtime from '@/runtime'
import compile from '@/test/helpers/compile'
import resolve from '@/test/helpers/resolve'

jest.mock('@aem-design/compose-support', () => ({
  logger: {
    info: jest.fn(),
  },
}))

describe('runtime', () => {
  const fixturesPath = path.resolve(process.cwd(), 'test/fixtures')

  let memoryFileSystem: IFs
  let restoreConsoleMock: RestoreConsole

  beforeEach(() => {
    memoryFileSystem   = createFsFromVolume(new Volume)
    restoreConsoleMock = mockConsole()

    mockFS({
      // aemdesign/compose-webpack package.json
      [resolve('node_modules/@aem-design/compose-webpack/package.json')]: JSON.stringify({
        version: '0.0.0-mock.0'
      }),

      // Project configuration
      // @ts-expect-error 'load' is not yet covered, implemented in upcoming @types update
      [resolve('pom.xml')]: mockFS.load(resolve('project.pom.xml', fixturesPath)),

      // Parent configuration
      // @ts-expect-error 'load' is not yet covered, implemented in upcoming @types update
      [resolve('../pom.xml')]: mockFS.load(resolve('parent.pom.xml', fixturesPath)),
    })
  })

  test('can compile es6 javascript entry', async (done) => {
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
          context: fixturesPath,
        },
      },
      {
        aem: {
          port: false,
        },

        prod    : true,
        project : 'mock',
      },
    )())

    // @ts-expect-error known that the webpack type and 'memory-fs' aren't compatible
    compiler.outputFileSystem = memoryFileSystem

    const stats = await compile(compiler)

    expect(stats.hasErrors()).toBe(false)

    console.log(memoryFileSystem.readdirSync('.'))

    done()
  })

  afterEach(() => {
    restoreConsoleMock()

    mockFS.restore()
  })
})
