import { listFiles } from 'git-essentials'

import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'

import listFilesFsFixtureData from './fixtures/fs/listFiles.json'
import checkoutFsFixtureData from './fixtures/fs/checkout.json'

describe('listFiles', () => {
  it('index', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(listFilesFsFixtureData as FsFixtureData)

    // Test
    const files = await listFiles({ fs, dir })

    // assert
    expect(files).toEqual([
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
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)

    // act
    const files = await listFiles({ fs, dir, ref: 'test-branch' })

    // assert
    expect(files).toEqual([
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
