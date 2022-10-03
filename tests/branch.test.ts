import { Errors, branch, init, currentBranch, listFiles } from 'git-essentials'

import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'
import { expectNotToFailAsync, expectToFailWithTypeAsync } from './helpers/assertionHelper'
import * as path from './helpers/path'

import branchFsFixtureData from './fixtures/fs/branch.json'
import branchStartPointFsFixtureData from './fixtures/fs/branch-start-point.json'


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

  it('branch with start point', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchStartPointFsFixtureData as FsFixtureData)
    let files = await fs.readdir(path.resolve(dir, '.git', 'refs', 'heads'))

    // assert
    expect(files).toEqual(['main', 'start-point'])

    // act
    await branch({ fs, dir, ref: 'test-branch', startPoint: 'start-point' })

    // assert
    files = await fs.readdir(path.resolve(dir, '.git', 'refs', 'heads'))
    expect(files).toEqual(['main', 'start-point', 'test-branch'])
    expect(await currentBranch({ fs, dir })).toEqual('main')
    expect(await fs.readFile(path.resolve(dir, '.git', 'refs', 'heads', 'test-branch'), { encoding: 'utf8' })
    ).toEqual(await fs.readFile(path.resolve(dir, '.git', 'refs', 'heads', 'start-point'), { encoding: 'utf8' }))
    expect(await listFiles({ fs, dir, ref: 'HEAD' })).toEqual(['new-file.txt'])
    expect(await listFiles({ fs, dir, ref: 'test-branch' })).toEqual([])
  })

  it('branch force=undefined', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchFsFixtureData as FsFixtureData)

    // act
    await branch({ fs, dir, ref: 'test-branch' })

    // assert
    expect(await currentBranch({ fs, dir })).toEqual('main')
    expect(await fs.exists(path.resolve(dir, '.git', 'refs/heads/test-branch'))).toBeTruthy()

    // act
    const action = async () => {
      await branch({ fs, dir, ref: 'test-branch' })
    }

    // assert
    await expectToFailWithTypeAsync(action, Errors.AlreadyExistsError)
  })

  it('branch force=false', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchFsFixtureData as FsFixtureData)

    // act
    await branch({ fs, dir, ref: 'test-branch' })

    // assert
    expect(await currentBranch({ fs, dir })).toEqual('main')
    expect(await fs.exists(path.resolve(dir, '.git', 'refs/heads/test-branch'))).toBeTruthy()

    // act
    const action = async () => {
      await branch({ fs, dir, ref: 'test-branch', force: false })
    }

    // assert
    await expectToFailWithTypeAsync(action, Errors.AlreadyExistsError)
  })

  it('branch force=true', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchFsFixtureData as FsFixtureData)

    // act
    await branch({ fs, dir, ref: 'test-branch' })

    // assert
    expect(await currentBranch({ fs, dir })).toEqual('main')
    expect(await fs.exists(path.resolve(dir, '.git', 'refs/heads/test-branch'))).toBeTruthy()

    // act
    const action = async () => {
      await branch({ fs, dir, ref: 'test-branch', force: true })
    }

    // assert
    await expectNotToFailAsync(action)
  })

  it('branch with start point force', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchStartPointFsFixtureData as FsFixtureData)

    // act
    await branch({ fs, dir, ref: 'test-branch', startPoint: 'start-point' })

    // assert
    expect(await currentBranch({ fs, dir })).toEqual('main')
    expect(await fs.exists(path.resolve(dir, '.git', 'refs/heads/test-branch'))).toBeTruthy()

    // act
    const action = async () => {
      await branch({ fs, dir, ref: 'test-branch', force: true })
    }

    // assert
    await expectNotToFailAsync(action)
    expect(await listFiles({ fs, dir, ref: 'test-branch' })).toEqual([
      'new-file.txt',
    ])
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
    await expectToFailWithTypeAsync(action, Errors.InvalidRefNameError)
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
    await expectToFailWithTypeAsync(action, Errors.MissingParameterError)
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
