import { InMemoryFsClient, TreeEntriesDto } from '../../src/clients/fs'

export async function makeFsFixture(dir: string, data?: TreeEntriesDto) {
  const targetDir = `/${dir}`
  const fs = new InMemoryFsClient()
  await fs.mkdir(targetDir)

  if (data) {
    fs.import(targetDir, data)
  }

  return { fs, dir: targetDir }
}
