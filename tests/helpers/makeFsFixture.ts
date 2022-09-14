import { FileSystem } from '../../src/models/FileSystem'
import { InMemoryFsClient } from './InMemoryFsClient'

export async function makeFsFixture(dir: string) {
  const targetDir = `/${dir}`
  const fs = new InMemoryFsClient()
  await fs.mkdir(targetDir)

  return {
    fsClient: fs,
    fs: new FileSystem(fs),
    dir: targetDir
  }
}
