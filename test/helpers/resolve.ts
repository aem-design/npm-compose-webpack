import { join } from 'path'

const workingDirectory = process.cwd()

export default (path: string, baseDir: string = workingDirectory): string => {
  return join(baseDir, path)
}
