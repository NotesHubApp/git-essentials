import { expect } from 'chai'

import { currentBranch } from '../src'
import { makeFsFixture, DataFixture } from './helpers/makeFsFixture'

import resolveRefDataFixture from './fixtures/data/resolveRef.json'
import detachedHeadDataFixture from './fixtures/data/detachedHead.json'

describe('currentBranch', () => {
  it('resolve HEAD to main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefDataFixture as DataFixture)

    // act
    const branch = await currentBranch({ fs, dir })

    // assert
    expect(branch).to.eq('main')
  })

  it('resolve HEAD to refs/heads/main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefDataFixture as DataFixture)

    // act
    const branch = await currentBranch({ fs, dir, fullname: true })

    // assert
    expect(branch).to.eq('refs/heads/main')
  })

  it('returns undefined if HEAD is detached', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(detachedHeadDataFixture as DataFixture)

    // act
    const branch = await currentBranch({ fs, dir })

    // assert
    expect(branch).to.be.undefined
  })
})
