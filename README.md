# Git Essentials

![GitHub](https://img.shields.io/github/license/NotesHubApp/git-essentials?color=blue)
[![Join the community on GitHub Discussions](https://img.shields.io/badge/Join%20the%20community-on%20GitHub%20Discussions-blue)](https://github.com/NotesHubApp/git-essentials/discussions)
[![Release](https://github.com/NotesHubApp/git-essentials/actions/workflows/release.yml/badge.svg)](https://github.com/NotesHubApp/git-essentials/actions/workflows/release.yml)
[![NPM Version](https://img.shields.io/npm/v/git-essentials?color=33cd56&logo=npm)](https://www.npmjs.com/package/git-essentials)

A collection of essential Git commands for your browser and Node.js written in TypeScript all without any native dependencies.

## Highlights
* The library aims for 100% interoperability with the canonical git implementation. This means it does all its operations by modifying files in a `.git` directory just like the git you are used to.

* The API has been designed to provide functionality as individual functions, code bundlers can produce smaller bundles by including only the functions your application uses (tree shaking). The bundled version of the package is not included.

* The documentation for the project is auto-generated from the source code so it will always be the most accurate representation of the actual code.

* The project is written in TypeScript which gives more confidence in making any changes in contrast to plain JavaScript. In addition, it makes code reading and debugging much easier. Source maps are also included so you can jump right into implementation from your code.

## Documentation

Visit [https://noteshubapp.github.io/git-essentials](https://noteshubapp.github.io/git-essentials) to view the full documentation.

## Installation

You can install it from npm:

```
npm i git-essentials
```

## Examples

### Node.js (server side)
```typescript
import fs from 'fs/promises'
import { clone } from 'git-essentials'
import { makeNodeHttpClient } from 'git-essentials/clients/request/NodeHttpClient'

const http = makeNodeHttpClient()
const dir = 'repos/Welcome'
const url = 'https://github.com/NotesHubApp/Welcome.git'

await clone({ fs, http, dir, url })
```

### Browser (client side)
```ts
import { clone } from 'git-essentials'
import { InMemoryFsClient } from 'git-essentials/clients/fs/InMemoryFsClient'
import { makeWebHttpClient } from 'git-essentials/clients/request/WebHttpClient'

// GitHub (like many other providers) does not return
// proper 'Access-Control-Allow-Origin' header for non-API requests.
// As a result, a browser will refuse to serve those requests.
// To overcome this limitation you can use CORS proxy server.
const corsProxyUrlTransformer = (originalUrl: string) => {
  // Please use this CORS proxy server only for testing and not production use.
  // You can fork this CORS proxy server from here:
  // https://github.com/alex-titarenko/gitcorsproxy
  // And host it by your own
  return `https://gitcorsproxy.vercel.app/api/cors?url=${encodeURIComponent(originalUrl)}`
}

const fs = new InMemoryFsClient()
const http = makeWebHttpClient({ transformRequestUrl: corsProxyUrlTransformer })
const dir = 'repos/Welcome'
const url = 'https://github.com/NotesHubApp/Welcome.git'

await clone({ fs, http, dir, url })
```

## Contributing

Check out the [`CONTRIBUTING`](./CONTRIBUTING.md) document for more instructions.

## Who is using this project?
* [NotesHub](https://noteshub.app) - fully cross-platform, vendor-agnostic, markdown based note-taking app

## Credits
This project is based on [isomorphic-git](https://github.com/isomorphic-git/isomorphic-git) library and would not be possible without the pioneering work by **@wmhilton** and all other amazing members of **isomorphic-git** community.

## License
This work is released under [The MIT License](./LICENSE.md).
