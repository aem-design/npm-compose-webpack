import path from 'path'
import mockConsole, { RestoreConsole } from 'jest-mock-console'
import mockFS from 'mock-fs'
import { createFsFromVolume, IFs, Volume } from 'memfs'
import webpack from 'webpack'

import { setConfiguration } from '@/config'

import { ConfigurationType } from '@/types/enums'

import compile from '../test/helpers/compile'
import configuration, { composeConfiguration } from '../test/helpers/configuration'
import lazyLoadNodeModules from '../test/helpers/lazy-load'
import resolve from '../test/helpers/resolve'

jest.mock('@aem-design/compose-support', () => ({
  logger: {
    error   : jest.fn(),
    info    : jest.fn(),
    warning : jest.fn(),
  },
}))

describe('runtime', () => {
  const fixturesPath = resolve('test/fixtures')

  const standardComposeConfiguration = composeConfiguration({
    standard: {
      projects: {
        'mock': {
          entryFile  : 'mock.js',
          outputName : 'mock',
        },
      },
    },
  })

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

      // Project configuration (invalid)
      [resolve('pom.invalid.xml')]: mockFS.load(resolve('project-invalid.pom.xml', fixturesPath)),

      // Parent configuration
      [resolve('../pom.xml')]: mockFS.load(resolve('parent.pom.xml', fixturesPath)),

      // Webpack entry file
      [resolve('mock/js/basic-es6.js')]: mockFS.load(resolve('mock/basic-es6.js', fixturesPath)),
    }

    // NOTE: This next bit is required in order to map 'node_modules' while 'mock-fs' is used, this is because 'mock-fs' returns 'null' everytime 'require' is used. It does add an extended period of time during test suite runs due to the amount of modules needing to be loaded.
    lazyLoadNodeModules(mockedFileSystem, resolve('node_modules'))

    mockFS(mockedFileSystem)
  })

  beforeEach(() => {
    memoryFileSystem   = createFsFromVolume(new Volume)
    restoreConsoleMock = mockConsole()
  })

  test('can generate a usable webpack configuration', () => {
    const config = configuration(standardComposeConfiguration, {
      project: 'mock',
    })

    const rules = config.module.rules as Required<webpack.RuleSetRule>[]

    expect(config.mode).toStrictEqual('development')

    expect(config.entry['mock']).toStrictEqual('./mock/js/mock.js')

    // @ts-expect-error need to work out how to ensure 'performance' is the correct type
    expect(config.performance.assetFilter('foo')).toStrictEqual(true)

    // @ts-expect-error there is a proxy set
    expect(config.devServer.proxy[0].context()).toStrictEqual(true)

    const fileLoaderOptions = rules[rules.length - 1].options as any

    const fileLoaderPublicPath = fileLoaderOptions.publicPath(
      null,
      resolve(fileLoaderOptions.context),
      resolve(path.join(fileLoaderOptions.context, 'mock/foo.css'))
    )

    expect(fileLoaderPublicPath).toStrictEqual('../../..')
  })

  test('can generate a usable hmr webpack configuration', () => {
    const config = configuration(standardComposeConfiguration, {
      project : 'mock',
      watch   : true,
    })

    const rules = config.module.rules as Required<webpack.RuleSetRule>[]

    expect(config.devtool).toStrictEqual('cheap-module-source-map')

    expect(config.output.publicPath).toStrictEqual('/')

    expect(rules[0].use[0]).toStrictEqual('style-loader')

    const fileLoaderOptions = rules[rules.length - 1].options as any

    const fileLoaderPublicPath = fileLoaderOptions.publicPath(
      null,
      resolve(fileLoaderOptions.context),
      resolve(path.join(fileLoaderOptions.context, 'mock/foo/bar.css'))
    )

    expect(fileLoaderPublicPath).toStrictEqual('/../../..')
  })

  test('can generate a usable production webpack configuration', () => {
    const config = configuration(standardComposeConfiguration, {
      dev     : false,
      prod    : true,
      project : 'mock',
    })

    expect(config.output.chunkFilename).toContain('[contenthash:8]')
  })

  test('can compile es6 javascript entry', async (done) => {
    const config = configuration(composeConfiguration({
      standard: {
        projects: {
          'mock': {
            entryFile  : 'basic-es6.js',
            outputName : 'mock',
          },
        },
      },
    }), { project: 'mock' })

    const compiler = webpack(config)

    // @ts-expect-error known that the webpack type and 'memory-fs' aren't compatible
    compiler.outputFileSystem = memoryFileSystem

    const stats = await compile(compiler)

    expect(stats.hasErrors()).toBe(false)

    const fileSystemOutput = memoryFileSystem.readdirSync('public/mock/clientlibs-footer/js')

    expect(fileSystemOutput).toHaveLength(1)
    expect(fileSystemOutput).toStrictEqual(['mock.js'])

    done()
  })

  test('error is thrown when disallowed webpack prop is set', () => {
    const config = () => configuration({
      ...standardComposeConfiguration,

      webpack: {
        // @ts-expect-error used to prove disallowed webpack props throw an error
        entry: 'foo',
      },
    }, { project: 'mock' })

    expect(config).toThrowError('Forbidden webpack property detected (entry)')
  })

  test('error is thrown when pom configuration is invalid', () => {
    setConfiguration(ConfigurationType.MAVEN_PROJECT, resolve('pom.invalid.xml'))

    const config = () => configuration(standardComposeConfiguration, {
      project: 'mock',
    })

    expect(config)
      .toThrowError('Unable to continue due to missing or invalid Maven configuration values!')
  })

  afterEach(() => {
    restoreConsoleMock()
  })

  afterAll(() => {
    mockFS.restore()
  })
})
