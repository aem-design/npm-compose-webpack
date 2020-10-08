import fs from 'fs'
import path from 'path'
import mockFS from 'mock-fs'

import type FileSystem from 'mock-fs/lib/filesystem'

function lazyLoadNodeModules(mockedFileSystem: FileSystem.DirectoryItems, from: string, depth = 10): void {
  const stat = fs.lstatSync(from)

  if (stat.isDirectory() && depth > 0) {
    for (const item of fs.readdirSync(from)) {
      if (item.startsWith('.') || item === '@types') {
        continue
      }

      lazyLoadNodeModules(mockedFileSystem, path.join(from, item), depth - 1)
    }
  } else if (stat.isFile()) {
    mockedFileSystem[from] = mockFS.load(from, { lazy: true })
  }
}

export default lazyLoadNodeModules
