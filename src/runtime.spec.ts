import path from 'path'
import mockConsole, { RestoreConsole } from 'jest-mock-console'
import mockFS from 'mock-fs'
import { createFsFromVolume, IFs, Volume } from 'memfs'
import webpack from 'webpack'

import compile from '@/test/helpers/compile'
import configuration from '@/test/helpers/configuration'
import lazyLoadNodeModules from '@/test/helpers/lazy-load'
import resolve from '@/test/helpers/resolve'

jest.mock('@aem-design/compose-support', () => ({
  logger: {
    error   : jest.fn(),
    info    : jest.fn(),
    warning : jest.fn(),
  },
}))

describe('runtime', () => {
  const fixturesPath = path.resolve(process.cwd(), 'test/fixtures')

  let memoryFileSystem: IFs
  let restoreConsoleMock: RestoreConsole

  beforeAll(() => {
    const mockedFileSystem = {
      // aemdesign/compose-webpack package.json
      [resolve('node_modules/@aem-design/compose-webpack/package.json')]: JSON.stringify({
        version: '0.0.0-mock.0'
      }),

      // Project configuration
      [resolve('pom.xml')]: mockFS.load(resolve('project.pom.xml', fixturesPath)),

      // Parent configuration
      [resolve('../pom.xml')]: mockFS.load(resolve('parent.pom.xml', fixturesPath)),
    }

    // NOTE: This next bit is required in order to map 'node_modules' while 'mock-fs' is used, this is because 'mock-fs' returns 'null' everytime 'require' is used. It does add an extended period of time during test suite runs due to the amount of modules needing to be loaded.
    lazyLoadNodeModules(mockedFileSystem, path.resolve(path.join(process.cwd(), 'node_modules')))

    mockFS(mockedFileSystem)
  })

  beforeEach(() => {
    memoryFileSystem   = createFsFromVolume(new Volume)
    restoreConsoleMock = mockConsole()
  })

  test('can generate a usable webpack configuration', () => {
    const config = configuration({
      entryFile:  'mock.js',
      outputName: 'mock',
      project:    'mock',
    })

    expect(config.mode).toStrictEqual('development')

    expect(config.entry['mock']).toStrictEqual('./mock/js/mock.js')
  })

  xtest('can compile es6 javascript entry', async (done) => {
    const config = configuration({
      entryFile:  'basic-es6.js',
      outputName: 'mock',
      project:    'mock',
    })

    const compiler = webpack(config)

    // @ts-expect-error known that the webpack type and 'memory-fs' aren't compatible
    compiler.outputFileSystem = memoryFileSystem

    const stats = await compile(compiler)

    expect(stats.hasErrors()).toBe(false)

    console.log(memoryFileSystem.readdirSync('.'))

    done()
  })

  afterEach(() => {
    restoreConsoleMock()
  })

  afterAll(() => {
    mockFS.restore()
  })
})
