import type Directory from 'mock-fs/lib/directory'
import type SymbolicLink from 'mock-fs/lib/symlink'

declare global {
  declare module 'mock-fs' {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace FileSystem {
      type DirectoryItem =
        | string
        | Buffer
        | (() => File)
        | (() => Directory)
        | (() => SymbolicLink)
        | DirectoryItems;

      interface DirectoryItems {
        [name: string]: DirectoryItem;
      }

      interface LoaderOptions {
        /** File content isn't loaded until explicitly read. */
        lazy?: boolean;
        /** Load all files and directories recursively. */
        recursive?: boolean;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace mock {
      /**
       * Load a real file/folder into the mock file system.
       */
      function load(path: string, options?: FileSystem.LoaderOptions): FileSystem.DirectoryItem;
    }
  }
}
