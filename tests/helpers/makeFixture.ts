import { InMemoryFsClient } from './InMemoryFsClient'

export async function makeFixture(dir: string) {
  const targetDir = `/${dir}`
  const fs = new InMemoryFsClient()
  await fs.mkdir(targetDir)

  return {
    fs: fs,
    dir: targetDir
  }
}
