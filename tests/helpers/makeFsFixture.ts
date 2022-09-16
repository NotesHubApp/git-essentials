import { InMemoryFsClient, TreeEntriesDto } from '../../src/clients/fs'

export async function makeFsFixture(data?: TreeEntriesDto) {
  const targetDir = `/test`
  const fs = new InMemoryFsClient()
  await fs.mkdir(targetDir)

  if (data) {
    fs.importInto(targetDir, data)
  }

  return { fs, dir: targetDir }
}
