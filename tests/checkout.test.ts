import { Errors, checkout, listFiles, add, commit, branch } from '../src'
import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'

import checkoutFsFixtureData from './fixtures/fs/checkout.json'

describe('checkout', () => {
  it('checkout', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)

    // act
    await checkout({ fs, dir, ref: 'test-branch' })

    // assert
    const files = await fs.readdir(dir)
    expect(files.sort()).toEqual([
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".git",
      ".gitignore",
      "LICENSE.md",
      "README.md",
      "package.json",
      "shrinkwrap.yaml",
      "src",
      "test",
    ])

    const index = await listFiles({ fs, dir })
    expect(index).toEqual([
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
    expect(sha).toBe('ref: refs/heads/test-branch\n')
  })

  it('checkout by tag', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)

    // act
    await checkout({ fs, dir, ref: 'v1.0.0' })

    // assert
    const files = await fs.readdir(dir)
    expect(files.sort()).toEqual([
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".git",
      ".gitignore",
      "LICENSE.md",
      "README.md",
      "package.json",
      "shrinkwrap.yaml",
      "src",
      "test",
    ])

    const index = await listFiles({ fs, dir })
    expect(index).toEqual([
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
    expect(sha).toBe('e10ebb90d03eaacca84de1af0a59b444232da99e\n')
  })

  it('checkout by SHA', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)

    // act
    await checkout({ fs, dir, ref: 'e10ebb90d03eaacca84de1af0a59b444232da99e' })

    // assert
    const files = await fs.readdir(dir)
    expect(files.sort()).toEqual([
      ".babelrc",
      ".editorconfig",
      ".flowconfig",
      ".git",
      ".gitignore",
      "LICENSE.md",
      "README.md",
      "package.json",
      "shrinkwrap.yaml",
      "src",
      "test",
    ])

    const index = await listFiles({ fs, dir })
    expect(index).toEqual([
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
    expect(sha).toBe('e10ebb90d03eaacca84de1af0a59b444232da99e\n')
  })

  it('checkout unfetched branch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)

    // act
    let error
    try {
      await checkout({ fs, dir, ref: 'missing-branch' })
      throw new Error('Checkout should have failed.')
    } catch (err: any) {
      error = err
    }

    // assert
    expect(error).toBeDefined()
    expect(error.caller).toBe('git.checkout')
    expect(error.code).toBe(Errors.CommitNotFetchedError.code)
    expect(error.data).toEqual({
      oid: "033417ae18b174f078f2f44232cb7a374f4c60ce",
      ref: "missing-branch"
    })
  })

  it('checkout file permissions', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)
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
    const actualRegularFileMode = (await fs.lstat(dir + '/regular-file.txt')).mode
    const actualExecutableFileMode = (await fs.lstat(dir + '/executable-file.sh')).mode

    expect(actualRegularFileMode).toBe(expectedRegularFileMode)
    expect(actualExecutableFileMode).toBe(expectedExecutableFileMode)
  })

  it('checkout changing file permissions', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)

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
    expect(actualRegularFileMode).toBe(expectedRegularFileMode)

    // act
    await checkout({ fs, dir, ref: 'executable-file' })
    // assert
    const { mode: actualExecutableFileMode } = await fs.lstat(dir + '/hello.sh')
    expect(actualExecutableFileMode).toBe(expectedExecutableFileMode)
  })

  it('checkout directories using filepaths', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)

    // act
    await checkout({ fs, dir, ref: 'test-branch', filepaths: ['src/models', 'test'] })

    // assert
    const files = await fs.readdir(dir)
    expect(files).toEqual([ ".git", "src", "test" ])

    const index = await listFiles({ fs, dir })
    expect(index).toEqual([
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
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)

    // act
    await checkout({ fs, dir, ref: 'test-branch', filepaths: ['src/models/GitBlob.js', 'src/utils/write.js'] })

    // assert
    const files = await fs.readdir(dir)
    expect(files).toEqual([ ".git", "src" ])

    const index = await listFiles({ fs, dir })
    expect(index).toEqual([
      "src/models/GitBlob.js",
      "src/utils/write.js",
    ])
  })

  it('checkout detects conflicts', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)
    await fs.writeFile(`${dir}/README.md`, 'Hello world', { encoding: 'utf8' })

    // act
    let error
    try {
      await checkout({ fs, dir, ref: 'test-branch' })
    } catch (e: any) {
      error = e
    }

    // assert
    expect(error).toBeDefined()
    expect(error.code).toBe(Errors.CheckoutConflictError.code)
    expect(error.data.filepaths).toEqual(['README.md'])
  })

  it('checkout files ignoring conflicts dry run', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)
    await fs.writeFile(`${dir}/README.md`, 'Hello world', { encoding: 'utf8' })

    // act
    let error = null
    try {
      await checkout({ fs, dir, ref: 'test-branch', force: true, dryRun: true })
    } catch (e) {
      error = e
    }

    // assert
    expect(error).toBeFalsy()
    expect(await fs.readFile(`${dir}/README.md`, { encoding: 'utf8' })).toBe('Hello world')
  })

  it('checkout files ignoring conflicts', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)
    await fs.writeFile(`${dir}/README.md`, 'Hello world', { encoding: 'utf8' })

    // act
    let error = null
    try {
      await checkout({ fs, dir, ref: 'test-branch', force: true })
    } catch (e) {
      error = e
    }

    // assert
    expect(error).toBeFalsy()
    expect(await fs.readFile(`${dir}/README.md`, { encoding: 'utf8' })).not.toBe('Hello world')
  })

  it('restore files to HEAD state by not providing a ref', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)
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
    expect(error).toBeFalsy()
    expect(await fs.readFile(`${dir}/README.md`, { encoding: 'utf8' })).not.toBe('Hello world')
  })

  it('checkout files should not delete other files', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(checkoutFsFixtureData as FsFixtureData)

    // act
    await checkout({ fs, dir, ref: 'test-branch' })
    await checkout({ fs, dir, ref: 'test-branch', filepaths: ['src/utils', 'test'] })

    // assert
    const files = await fs.readdir(dir)
    expect(files).toContain('README.md')
  })
})
