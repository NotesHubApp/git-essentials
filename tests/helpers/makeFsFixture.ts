import { InMemoryFsClient, TreeEntriesDto as DataFixture } from '../../src/clients/fs'
export { DataFixture }

export async function makeFsFixture(data?: DataFixture) {
  const targetDir = `/test`
  const fs = new InMemoryFsClient()
  await fs.mkdir(targetDir)

  if (data) {
    fs.import(targetDir, data)
  }

  return { fs, dir: targetDir }
}
