import { expect } from 'chai'

import { remove, listFiles } from '../src'
import { makeFsFixture, FsFixture } from './helpers/makeFsFixture'

import remoteFsFixture from './fixtures/fs/remove.json'

describe('remove', () => {
  it('file', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(remoteFsFixture as FsFixture)

    // act
    const before = await listFiles({ fs, dir })

    // assert
    expect(before).to.have.members([
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".gitignore",
      ".travis.yml",
      "LICENSE.md",
      "package-lock.json",
      "package.json",
      "shrinkwrap.yaml",
      "src/commands/checkout.js",
      "src/commands/config.js",
      "src/commands/fetch.js",
      "src/commands/init.js",
      "src/index.js",
      "src/models/GitBlob.js",
      "src/models/GitCommit.js",
      "src/models/GitConfig.js",
      "src/models/GitObject.js",
      "src/models/GitTree.js",
      "src/utils/exists.js",
      "src/utils/mkdirs.js",
      "src/utils/read.js",
      "src/utils/resolveRef.js",
      "src/utils/write.js",
    ])

    // act
    await remove({ fs, dir, filepath: 'LICENSE.md' })
    const after = await listFiles({ fs, dir })

    // assert
    expect(after).to.have.members([
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".gitignore",
      ".travis.yml",
      "package-lock.json",
      "package.json",
      "shrinkwrap.yaml",
      "src/commands/checkout.js",
      "src/commands/config.js",
      "src/commands/fetch.js",
      "src/commands/init.js",
      "src/index.js",
      "src/models/GitBlob.js",
      "src/models/GitCommit.js",
      "src/models/GitConfig.js",
      "src/models/GitObject.js",
      "src/models/GitTree.js",
      "src/utils/exists.js",
      "src/utils/mkdirs.js",
      "src/utils/read.js",
      "src/utils/resolveRef.js",
      "src/utils/write.js",
    ])

    expect(before.length === after.length + 1).to.be.true
  })

  it('dir', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(remoteFsFixture as FsFixture)

    // act
    const before = await listFiles({ fs, dir })

    // assert
    expect(before).to.have.members([
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".gitignore",
      ".travis.yml",
      "LICENSE.md",
      "package-lock.json",
      "package.json",
      "shrinkwrap.yaml",
      "src/commands/checkout.js",
      "src/commands/config.js",
      "src/commands/fetch.js",
      "src/commands/init.js",
      "src/index.js",
      "src/models/GitBlob.js",
      "src/models/GitCommit.js",
      "src/models/GitConfig.js",
      "src/models/GitObject.js",
      "src/models/GitTree.js",
      "src/utils/exists.js",
      "src/utils/mkdirs.js",
      "src/utils/read.js",
      "src/utils/resolveRef.js",
      "src/utils/write.js",
    ])

    // act
    await remove({ fs, dir, filepath: 'src/models' })
    const after = await listFiles({ fs, dir })

    // assert
    expect(after).to.have.members([
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".gitignore",
      ".travis.yml",
      "LICENSE.md",
      "package-lock.json",
      "package.json",
      "shrinkwrap.yaml",
      "src/commands/checkout.js",
      "src/commands/config.js",
      "src/commands/fetch.js",
      "src/commands/init.js",
      "src/index.js",
      "src/utils/exists.js",
      "src/utils/mkdirs.js",
      "src/utils/read.js",
      "src/utils/resolveRef.js",
      "src/utils/write.js",
    ])

    expect(before.length === after.length + 5).to.be.true
  })
})
