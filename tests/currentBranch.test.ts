import { expect } from 'chai'

import { currentBranch } from '../src'
import { makeFsFixture } from './helpers/makeFsFixture'
import { TreeEntriesDto } from '../src/clients/fs'

import resolveRefDataFixture from './fixtures/data/resolveRef.json'
import detachedHeadDataFixture from './fixtures/data/detachedHead.json'

describe('currentBranch', () => {
  it('resolve HEAD to master', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture('test-resolveRef', resolveRefDataFixture as TreeEntriesDto)

    // act
    const branch = await currentBranch({ fs, dir })

    // assert
    expect(branch).to.eq('master')
  })

  it('resolve HEAD to refs/heads/master', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture('test-resolveRef', resolveRefDataFixture as TreeEntriesDto)

    // act
    const branch = await currentBranch({ fs, dir, fullname: true })

    // assert
    expect(branch).to.eq('refs/heads/master')
  })

  it('returns undefined if HEAD is detached', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture('test-detachedHead', detachedHeadDataFixture as TreeEntriesDto)

    // act
    const branch = await currentBranch({ fs, dir })

    // assert
    expect(branch).to.be.undefined
  })
})
