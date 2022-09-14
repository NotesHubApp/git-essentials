import { InMemoryFsClient } from '../../src/clients/fs'

export async function makeFsFixture(dir: string) {
  const targetDir = `/${dir}`
  const fs = new InMemoryFsClient()
  await fs.mkdir(targetDir)

  return { fs, dir: targetDir }
}
