# Git-Essentials
A collection of essential Git commands for your browser and Node.js.

## Usage Examples

### Node.js
```typescript
import fs from 'fs/promises'
import { clone } from 'git-essentials'
import { makeNodeHttpClient } from 'git-essentials/clients/request/NodeHttpClient'

const http = makeNodeHttpClient()
const dir = 'repos/Welcome'
const url = 'https://github.com/NotesHubApp/Welcome.git'

await clone({ fs, http, dir, url })
```

### Browser
```typescript
import { clone } from 'git-essentials'
import { InMemoryFsClient } from 'git-essentials/clients/fs/InMemoryFsClient'
import { makeWebHttpClient } from 'git-essentials/clients/request/WebHttpClient'

const corsProxyUrlTransformer = (originalUrl: string) => {
  return `https://www.noteshub.app/api/cors-proxy.ts?url=${encodeURIComponent(originalUrl)}`
}

const fs = new InMemoryFsClient()
const http = makeWebHttpClient({ transformRequestUrl: corsProxyUrlTransformer })
const dir = 'repos/Welcome'
const url = 'https://github.com/NotesHubApp/Welcome.git'

await clone({ fs, http, dir, url })
```
