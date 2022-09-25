import { currentBranch } from '../src'
import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'

import resolveRefFsFixtureData from './fixtures/fs/resolveRef.json'
import detachedHeadFsFixtureData from './fixtures/fs/detachedHead.json'

describe('currentBranch', () => {
  it('resolve HEAD to main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixtureData as FsFixtureData)

    // act
    const branch = await currentBranch({ fs, dir })

    // assert
    expect(branch).toBe('main')
  })

  it('resolve HEAD to refs/heads/main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixtureData as FsFixtureData)

    // act
    const branch = await currentBranch({ fs, dir, fullname: true })

    // assert
    expect(branch).toBe('refs/heads/main')
  })

  it('returns undefined if HEAD is detached', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(detachedHeadFsFixtureData as FsFixtureData)

    // act
    const branch = await currentBranch({ fs, dir })

    // assert
    expect(branch).toBeUndefined()
  })
})
