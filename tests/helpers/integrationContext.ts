import { FsClient, HttpClient } from 'git-essentials'
import { InMemoryFsClient } from 'src/clients/fs/InMemoryFsClient'
import { makeWebHttpClient } from 'src/clients/http/WebHttpClient'
import { makeNodeHttpClient } from 'src/clients/http/NodeHttpClient'

const isBrowser = () => typeof window !== `undefined`

const corsProxyUrlTransformer = (originalUrl: string) => {
  return `https://gitcorsproxy.vercel.app/api/cors?url=${encodeURIComponent(originalUrl)}`
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

  const dir = `temp_${generateId(20)}`
  await fs.mkdir(dir)

  try {
    await action({ fs, http, dir })
  } finally {
    await fs.rm(dir, { recursive: true })
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

