import { InMemoryFsClient, TreeEntriesDto as FsFixture } from '../../src/clients/fs'
export { FsFixture }

export async function makeFsFixture(data?: FsFixture) {
  const targetDir = `/test`
  const fs = new InMemoryFsClient()
  await fs.mkdir(targetDir)

  if (data) {
    fs.import(targetDir, data)
  }

  return { fs, dir: targetDir }
}
