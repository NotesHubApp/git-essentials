import { expect } from 'chai'

import { listFiles } from '../src'
import { makeFsFixture, DataFixture } from './helpers/makeFsFixture'

import listFilesDataFixture from './fixtures/data/listFiles.json'
import checkoutDataFixture from './fixtures/data/checkout.json'

describe('listFiles', () => {
  it('index', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(listFilesDataFixture as DataFixture)

    // Test
    const files = await listFiles({ fs, dir })

    // assert
    expect(files).to.have.members([
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".gitignore",
      ".travis.yml",
      "LICENSE.md",
      "README.md",
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
      "test/_helpers.js",
      "test/snapshots/test-resolveRef.js.md",
      "test/snapshots/test-resolveRef.js.snap",
      "test/test-clone.js",
      "test/test-config.js",
      "test/test-init.js",
      "test/test-resolveRef.js",
    ])
  })

  it('ref', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)

    // act
    const files = await listFiles({ fs, dir, ref: 'test-branch' })

    // assert
    expect(files).to.have.members([
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".gitignore",
      "LICENSE.md",
      "README.md",
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
      "src/models/GitTree.js",
      "src/utils/combinePayloadAndSignature.js",
      "src/utils/commitSha.js",
      "src/utils/exists.js",
      "src/utils/mkdirs.js",
      "src/utils/read.js",
      "src/utils/resolveRef.js",
      "src/utils/unwrapObject.js",
      "src/utils/wrapCommit.js",
      "src/utils/write.js",
      "test/resolveRef.js",
      "test/smoke.js",
      "test/snapshots/resolveRef.js.md",
      "test/snapshots/resolveRef.js.snap",
    ])
  })
})
