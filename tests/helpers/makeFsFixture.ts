import { InMemoryFsClient, TreeEntriesDto as FsFixtureData } from '../../src/clients/fs/InMemoryFsClient'
export { FsFixtureData }

export async function makeFsFixture(data?: FsFixtureData) {
  const targetDir = `/test`
  const fs = new InMemoryFsClient()
  await fs.mkdir(targetDir)

  if (data) {
    fs.import(targetDir, data)
  }

  return { fs, dir: targetDir }
}
