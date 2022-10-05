import { FsClient, HttpClient } from 'git-essentials'
import { InMemoryFsClient } from 'src/clients/fs/InMemoryFsClient'
import { makeWebHttpClient } from 'src/clients/request/WebHttpClient'
import { makeNodeHttpClient } from 'src/clients/request/NodeHttpClient'
import { join } from 'src/utils/join'

const isBrowser = () => typeof window !== `undefined`

const corsProxyUrlTransformer = (originalUrl: string) => {
  return `https://www.noteshub.app/api/cors-proxy.ts?url=${encodeURIComponent(originalUrl)}`
}

type IntegrationContext = {
  fs: FsClient
  http: HttpClient
  dir: string
}

export async function integrationContext(action: (context: IntegrationContext) => Promise<void>) {
  const { fs, http } = isBrowser() ? {
    fs: new InMemoryFsClient(),
    http: makeWebHttpClient({ transformRequestUrl: corsProxyUrlTransformer })
  } : {
    fs: (await import('fs')).promises,
    http: makeNodeHttpClient()
  }

  const dir = generateId(20)
  await fs.mkdir(dir)

  try {
    await action({ fs, http, dir })
  } finally {
    await deleteRecursively(fs, dir)
  }
}

function generateId(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
 }
 return result
}

async function deleteRecursively(fs: FsClient, dirname: string) {
  const filesToDelete: string[] = []
  const directoriesToDelete: string[] = []
  const pathsToTraverse = [dirname]

  while (pathsToTraverse.length > 0) {
    const path = pathsToTraverse.pop()!

    if ((await fs.stat(path)).isDirectory()) {
      directoriesToDelete.push(path)
      pathsToTraverse.push(
        ...(await fs.readdir(path))!.map(subPath => join(path, subPath))
      )
    } else {
      filesToDelete.push(path)
    }
  }

  for (const path of filesToDelete) {
    await fs.unlink(path)
  }
  for (const path of directoriesToDelete.reverse()) {
    await fs.rmdir(path)
  }
}