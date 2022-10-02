# Git-Essentials
A collection of essential Git commands for your browser and Node.js.

# Usage Examples

## Node.js
```typescript
import fs from 'fs/promises'
import { clone, HttpClients } from 'git-essentials'

const http = HttpClients.makeNodeHttpClient()
const dir = 'repos/Welcome'
const url = 'https://github.com/NotesHubApp/Welcome.git'

await clone({ fs, http, dir, url })
```

## Browser
```typescript
import { clone, FsClients, HttpClients } from 'git-essentials'

const corsProxyUrlTransformer = (originalUrl: string) => {
  return `https://www.noteshub.app/api/cors-proxy.ts?url=${encodeURIComponent(originalUrl)}`
}

const fs = new FsClients.InMemoryFsClient()
const http = HttpClients.makeWebHttpClient({ transformRequestUrl: corsProxyUrlTransformer })
const dir = 'repos/Welcome'
const url = 'https://github.com/NotesHubApp/Welcome.git'

await clone({ fs, http, dir, url })
```
