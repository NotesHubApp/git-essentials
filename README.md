# Git Essentials
A collection of essential Git commands for your browser and Node.js.

[![Release](https://github.com/NotesHubApp/git-essentials/actions/workflows/release.yml/badge.svg)](https://github.com/NotesHubApp/git-essentials/actions/workflows/release.yml)
[![NPM Version](https://img.shields.io/npm/v/git-essentials?color=33cd56&logo=npm)](https://www.npmjs.com/package/git-essentials)

## Documentation

Visit [https://noteshubapp.github.io/git-essentials](https://noteshubapp.github.io/git-essentials) to view the full documentation.

## Examples

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

// GitHub (like some other providers) does not return proper 'Access-Control-Allow-Origin' header
// as a result the browser will refuse to serve the request.
// To overcome this limitation CORS proxy server could be used.
const corsProxyUrlTransformer = (originalUrl: string) => {
  return `https://www.noteshub.app/api/cors-proxy.ts?url=${encodeURIComponent(originalUrl)}`
}

const fs = new InMemoryFsClient()
const http = makeWebHttpClient({ transformRequestUrl: corsProxyUrlTransformer })
const dir = 'repos/Welcome'
const url = 'https://github.com/NotesHubApp/Welcome.git'

await clone({ fs, http, dir, url })
```
