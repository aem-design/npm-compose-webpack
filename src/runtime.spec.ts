import path from 'path'
import mockConsole from 'jest-mock-console'
import mockFS from 'mock-fs'
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
  const workingDirectory = process.cwd()

  let memoryFileSystem: MemoryFS

  beforeEach(() => {
    memoryFileSystem = new MemoryFS

    mockFS({
      // aemdesign/compose-webpack package.json
      [path.resolve(workingDirectory, 'node_modules/@aem-design/compose-webpack/package.json')]: JSON.stringify({
        version: '0.0.0-mock.0'
      }),

      // Project configuration
      [path.resolve(workingDirectory, 'pom.xml')]: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <properties>
    <package.path.apps>apps</package.path.apps>
    <package.appsPath>mock-compose</package.appsPath>
  </properties>
</project>`,

      // Parent configuration
      [path.resolve(workingDirectory, '../pom.xml')]: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <properties>
    <crx.port>9000</crx.port>
  </properties>
</project>`,
    })
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
          context: path.resolve(__dirname, '__tests__/fixtures'),
        },
      },
      {
        aem: {
          port: 9000,
        },

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

  afterEach(() => {
    mockFS.restore()
  })
})
