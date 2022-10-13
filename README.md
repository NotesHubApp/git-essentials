# Git Essentials

![GitHub](https://img.shields.io/github/license/NotesHubApp/git-essentials?color=blue)
[![Release](https://github.com/NotesHubApp/git-essentials/actions/workflows/release.yml/badge.svg)](https://github.com/NotesHubApp/git-essentials/actions/workflows/release.yml)
[![NPM Version](https://img.shields.io/npm/v/git-essentials?color=33cd56&logo=npm)](https://www.npmjs.com/package/git-essentials)

A collection of essential Git commands for your browser and Node.js.

## Documentation

Visit [https://noteshubapp.github.io/git-essentials](https://noteshubapp.github.io/git-essentials) to view the full documentation.

## Installation

You can install it from npm:

```
npm i git-essentials
```

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
  // Please use this CORS proxy server only for testing and not production use.
  // You can fork CORS proxy server from here https://github.com/alex-titarenko/gitcorsproxy
  return `https://gitcorsproxy.vercel.app/api/cors?url=${encodeURIComponent(originalUrl)}`
}

const fs = new InMemoryFsClient()
const http = makeWebHttpClient({ transformRequestUrl: corsProxyUrlTransformer })
const dir = 'repos/Welcome'
const url = 'https://github.com/NotesHubApp/Welcome.git'

await clone({ fs, http, dir, url })
```
## Credits
This project is based on [isomorphic-git](https://github.com/isomorphic-git/isomorphic-git) library and would not be possible without the pioneering work by **@wmhilton** and all other members of **isomorphic-git** community.

## License
This work is released under [The MIT License](./LICENSE.md).
