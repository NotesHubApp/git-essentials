import { expect } from 'chai'

import { currentBranch } from '../src'
import { makeFsFixture, FsFixture } from './helpers/makeFsFixture'

import resolveRefFsFixture from './fixtures/fs/resolveRef.json'
import detachedHeadFsFixture from './fixtures/fs/detachedHead.json'

describe('currentBranch', () => {
  it('resolve HEAD to main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixture as FsFixture)

    // act
    const branch = await currentBranch({ fs, dir })

    // assert
    expect(branch).to.eq('main')
  })

  it('resolve HEAD to refs/heads/main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixture as FsFixture)

    // act
    const branch = await currentBranch({ fs, dir, fullname: true })

    // assert
    expect(branch).to.eq('refs/heads/main')
  })

  it('returns undefined if HEAD is detached', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(detachedHeadFsFixture as FsFixture)

    // act
    const branch = await currentBranch({ fs, dir })

    // assert
    expect(branch).to.be.undefined
  })
})
