import { Errors, branch, init, currentBranch } from '../src'
import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'
import { expectToFailAsync } from './helpers/assertionHelper'
import * as path from './helpers/path'

import branchFsFixtureData from './fixtures/fs/branch.json'

describe('branch', () => {
  it('branch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchFsFixtureData as FsFixtureData)

    // act
    await branch({ fs, dir, ref: 'test-branch' })
    const files = await fs.readdir(path.resolve(dir, '.git', 'refs', 'heads'))

    // assert
    expect(files).toEqual(['main', 'test-branch'])
    expect(await currentBranch({ fs, dir })).toBe('main')
  })

  it('branch --checkout', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchFsFixtureData as FsFixtureData)

    // act
    await branch({ fs, dir, ref: 'test-branch', checkout: true })

    // assert
    expect(await currentBranch({ fs, dir })).toBe('test-branch')
  })

  it('invalid branch name', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchFsFixtureData as FsFixtureData)

    // act
    const action = async () => {
      await branch({ fs, dir, ref: 'inv@{id..branch.lock' })
    }

    // assert
    await expectToFailAsync(action, (err) => err instanceof Errors.InvalidRefNameError)
  })

  it('missing ref argument', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchFsFixtureData as FsFixtureData)

    // act
    const action = async () => {
      // @ts-ignore
      await branch({ fs, dir })
    }

    // assert
    await expectToFailAsync(action, (err) => err instanceof Errors.MissingParameterError)
  })

  it('empty repo', async () => {
    // arrange
    const { dir, fs } = await makeFsFixture()
    await init({ fs, dir })

    // act
    await branch({ fs, dir, ref: 'test-branch', checkout: true })

    // assert
    const file = await fs.readFile(path.resolve(dir, '.git', 'HEAD'), { encoding: 'utf8' })
    expect(file).toBe(`ref: refs/heads/test-branch\n`)
  })

  it('create branch with same name as a remote', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchFsFixtureData as FsFixtureData)

    // act
    await branch({ fs, dir, ref: 'origin' })

    // assert
    expect(await fs.exists(path.resolve(dir, '.git', 'refs/heads/origin'))).toBe(true)
  })

  it('create branch named "HEAD"', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchFsFixtureData as FsFixtureData)

    // act
    await branch({ fs, dir, ref: 'HEAD' })

    // assert
    expect(await fs.exists(path.resolve(dir, '.git', 'refs/heads/HEAD'))).toBe(true)
  })
})
