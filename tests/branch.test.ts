import { expect } from 'chai'

import { Errors, branch, init, currentBranch } from '../src'
import { makeFsFixture, DataFixture } from './helpers/makeFsFixture'
import * as path from './helpers/path'

import branchDataFixture from './fixtures/data/branch.json'

describe('branch', () => {
  it('branch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchDataFixture as DataFixture)

    // act
    await branch({ fs, dir, ref: 'test-branch' })
    const files = await fs.readdir(path.resolve(dir, '.git', 'refs', 'heads'))

    // assert
    expect(files).to.eql(['master', 'test-branch'])
    expect(await currentBranch({ fs, dir })).to.eq('master')
  })

  it('branch --checkout', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchDataFixture as DataFixture)

    // act
    await branch({ fs, dir, ref: 'test-branch', checkout: true })

    // assert
    expect(await currentBranch({ fs, dir })).to.eq('test-branch')
  })

  it('invalid branch name', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchDataFixture as DataFixture)
    let error = null

    // act
    try {
      await branch({ fs, dir, ref: 'inv@{id..branch.lock' })
    } catch (err) {
      error = err
    }

    // assert
    expect(error).not.to.be.null
    expect(error instanceof Errors.InvalidRefNameError).to.be.true
  })

  it('missing ref argument', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchDataFixture as DataFixture)
    let error = null

    // act
    try {
      // @ts-ignore
      await branch({ fs, dir })
    } catch (err) {
      error = err
    }

    // assert
    expect(error).not.to.be.null
    expect(error instanceof Errors.MissingParameterError).to.be.true
  })

  it('empty repo', async () => {
    // arrange
    const { dir, fs } = await makeFsFixture()
    await init({ fs, dir })
    let error = null

    // act
    try {
      await branch({ fs, dir, ref: 'test-branch', checkout: true })
    } catch (err) {
      error = err
    }

    // assert
    expect(error).to.be.null
    const file = await fs.readFile(path.resolve(dir, '.git', 'HEAD'), { encoding: 'utf8' })
    expect(file).to.eq(`ref: refs/heads/test-branch\n`)
  })

  it('create branch with same name as a remote', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchDataFixture as DataFixture)
    let error = null

    // act
    try {
      await branch({ fs, dir, ref: 'origin' })
    } catch (err) {
      error = err
    }

    // assert
    expect(error).to.be.null
    expect(await fs.exists(path.resolve(dir, '.git', 'refs/heads/origin'))).to.be.true
  })

  it('create branch named "HEAD"', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(branchDataFixture as DataFixture)
    let error = null

    // act
    try {
      await branch({ fs, dir, ref: 'HEAD' })
    } catch (err) {
      error = err
    }

    // assert
    expect(error).to.be.null
    expect(await fs.exists(path.resolve(dir, '.git', 'refs/heads/HEAD'))).to.be.true
  })
})
