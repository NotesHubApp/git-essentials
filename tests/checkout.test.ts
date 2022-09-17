import { expect } from 'chai'

import { Errors, checkout, listFiles, add, commit, branch } from '../src'
import { makeFsFixture, DataFixture } from './helpers/makeFsFixture'

import checkoutDataFixture from './fixtures/data/checkout.json'

describe('checkout', () => {
  it('checkout', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)

    // act
    await checkout({ fs, dir, ref: 'test-branch' })
    const files = await fs.readdir(dir)
    expect(files).to.have.members([
      ".git",
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".gitignore",
      "LICENSE.md",
      "README.md",
      "package.json",
      "shrinkwrap.yaml",
      "src",
      "test",
    ])

    const index = await listFiles({ fs, dir })
    expect(index).to.have.members([
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

    const sha = await fs.readFile(`${dir}/.git/HEAD`, { encoding: 'utf8' })
    expect(sha).to.eq('ref: refs/heads/test-branch\n')
  })

  it('checkout by tag', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)

    // act
    await checkout({ fs, dir, ref: 'v1.0.0' })

    // assert
    const files = await fs.readdir(dir)
    expect(files).to.have.members([
      ".git",
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".gitignore",
      "LICENSE.md",
      "README.md",
      "package.json",
      "shrinkwrap.yaml",
      "src",
      "test",
    ])

    const index = await listFiles({ fs, dir })
    expect(index).to.have.members([
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

    const sha = await fs.readFile(`${dir}/.git/HEAD`, { encoding: 'utf8' })
    expect(sha).to.eq('e10ebb90d03eaacca84de1af0a59b444232da99e\n')
  })

  it('checkout by SHA', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)

    // act
    await checkout({ fs, dir, ref: 'e10ebb90d03eaacca84de1af0a59b444232da99e' })

    // assert
    const files = await fs.readdir(dir)
    expect(files).to.have.members([
      ".git",
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".gitignore",
      "LICENSE.md",
      "README.md",
      "package.json",
      "shrinkwrap.yaml",
      "src",
      "test",
    ])

    const index = await listFiles({ fs, dir })
    expect(index).to.have.members([
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

    const sha = await fs.readFile(`${dir}/.git/HEAD`, { encoding: 'utf8' })
    expect(sha).to.eq('e10ebb90d03eaacca84de1af0a59b444232da99e\n')
  })

  it('checkout unfetched branch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)

    // act
    let error = null
    try {
      await checkout({ fs, dir, ref: 'missing-branch' })
      throw new Error('Checkout should have failed.')
    } catch (err: any) {
      error = err
    }

    // assert
    expect(error).not.to.be.null
    expect(error.caller).to.eq('git.checkout')
    expect(error.code).to.eq(Errors.CommitNotFetchedError.code)
    expect(error.data).to.eql({
      oid: "033417ae18b174f078f2f44232cb7a374f4c60ce",
      ref: "missing-branch"
    })
  })

  it('checkout file permissions', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)
    await branch({ fs, dir, ref: 'other', checkout: true })
    await checkout({ fs, dir, ref: 'test-branch' })
    await fs.writeFile(dir + '/regular-file.txt', 'regular file', { mode: 0o666 })
    await fs.writeFile(dir + '/executable-file.sh', 'executable file', { mode: 0o777 })
    const expectedRegularFileMode = (await fs.lstat(dir + '/regular-file.txt')).mode
    const expectedExecutableFileMode = (await fs.lstat(dir + '/executable-file.sh')).mode
    await add({ fs, dir, filepath: 'regular-file.txt' })
    await add({ fs, dir, filepath: 'executable-file.sh' })
    await commit({
      fs, dir, author: { name: 'Git', email: 'git@example.org' }, message: 'add files'
    })

    // act
    await checkout({ fs, dir, ref: 'other' })
    await checkout({ fs, dir, ref: 'test-branch' })

    // assert
    const actualRegularFileMode = (await fs.lstat(dir + '/regular-file.txt'))
      .mode
    const actualExecutableFileMode = (
      await fs.lstat(dir + '/executable-file.sh')
    ).mode

    expect(actualRegularFileMode).to.eq(expectedRegularFileMode)
    expect(actualExecutableFileMode).to.eq(expectedExecutableFileMode)
  })

  it('checkout changing file permissions', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)

    await fs.writeFile(dir + '/regular-file.txt', 'regular file', { mode: 0o666 })
    await fs.writeFile(dir + '/executable-file.sh', 'executable file', { mode: 0o777 })
    const { mode: expectedRegularFileMode } = await fs.lstat(
      dir + '/regular-file.txt'
    )
    const { mode: expectedExecutableFileMode } = await fs.lstat(
      dir + '/executable-file.sh'
    )

    // act
    await checkout({ fs, dir, ref: 'regular-file' })
    // assert
    const { mode: actualRegularFileMode } = await fs.lstat(dir + '/hello.sh')
    expect(actualRegularFileMode).to.eq(expectedRegularFileMode)

    // act
    await checkout({ fs, dir, ref: 'executable-file' })
    // assert
    const { mode: actualExecutableFileMode } = await fs.lstat(dir + '/hello.sh')
    expect(actualExecutableFileMode).to.eq(expectedExecutableFileMode)
  })

  it('checkout directories using filepaths', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)

    // act
    await checkout({ fs, dir, ref: 'test-branch', filepaths: ['src/models', 'test'] })

    // assert
    const files = await fs.readdir(dir)
    expect(files).to.have.members([ ".git", "src", "test" ])

    const index = await listFiles({ fs, dir })
    expect(index).to.have.members([
      "src/models/GitBlob.js",
      "src/models/GitCommit.js",
      "src/models/GitConfig.js",
      "src/models/GitTree.js",
      "test/resolveRef.js",
      "test/smoke.js",
      "test/snapshots/resolveRef.js.md",
      "test/snapshots/resolveRef.js.snap",
    ])
  })

  it('checkout files using filepaths', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)

    // act
    await checkout({ fs, dir, ref: 'test-branch', filepaths: ['src/models/GitBlob.js', 'src/utils/write.js'] })

    // assert
    const files = await fs.readdir(dir)
    expect(files).to.have.members([ ".git", "src" ])

    const index = await listFiles({ fs, dir })
    expect(index).to.have.members([
      "src/models/GitBlob.js",
      "src/utils/write.js",
    ])
  })

  it('checkout detects conflicts', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)
    await fs.writeFile(`${dir}/README.md`, 'Hello world', { encoding: 'utf8' })

    // act
    let error = null
    try {
      await checkout({ fs, dir, ref: 'test-branch' })
    } catch (e: any) {
      error = e
    }

    // assert
    expect(error).not.to.be.null
    expect(error.code).to.eq(Errors.CheckoutConflictError.code)
    expect(error.data.filepaths).to.eql(['README.md'])
  })

  it('checkout files ignoring conflicts dry run', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)
    await fs.writeFile(`${dir}/README.md`, 'Hello world', { encoding: 'utf8' })

    // act
    let error = null
    try {
      await checkout({ fs, dir, ref: 'test-branch', force: true, dryRun: true })
    } catch (e) {
      error = e
    }

    // assert
    expect(error).to.be.null
    expect(await fs.readFile(`${dir}/README.md`, { encoding: 'utf8' })).to.eq('Hello world')
  })

  it('checkout files ignoring conflicts', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)
    await fs.writeFile(`${dir}/README.md`, 'Hello world', { encoding: 'utf8' })

    // act
    let error = null
    try {
      await checkout({ fs, dir, ref: 'test-branch', force: true })
    } catch (e) {
      error = e
    }

    // assert
    expect(error).to.be.null
    expect(await fs.readFile(`${dir}/README.md`, { encoding: 'utf8' })).not.to.eq('Hello world')
  })

  it('restore files to HEAD state by not providing a ref', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)
    await checkout({ fs, dir, ref: 'test-branch' })
    await fs.writeFile(`${dir}/README.md`, 'Hello world', { encoding: 'utf8' })

    // act
    let error = null
    try {
      await checkout({ fs, dir, force: true })
    } catch (e) {
      error = e
    }

    // assert
    expect(error).to.be.null
    expect(await fs.readFile(`${dir}/README.md`, { encoding: 'utf8' })).not.to.eq('Hello world')
  })

  it('checkout files should not delete other files', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutDataFixture as DataFixture)

    // act
    await checkout({ fs, dir, ref: 'test-branch' })
    await checkout({ fs, dir, ref: 'test-branch', filepaths: ['src/utils', 'test'] })

    // assert
    const files = await fs.readdir(dir)
    expect(files).to.contain('README.md')
  })
})
