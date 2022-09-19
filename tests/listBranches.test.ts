import { expect } from 'chai'

import { listBranches } from '../src'
import { makeFsFixture, FsFixture } from './helpers/makeFsFixture'

import listBranchesFsFixture from './fixtures/data/listBranches.json'


describe('listBranches', () => {
  it('listBranches', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(listBranchesFsFixture as FsFixture)

    // act
    const commits = await listBranches({ fs, dir })

    // assert
    expect(commits).to.have.members([
      "feature/supercool",
      "greenkeeper/initial",
      "master",
      "test-branch",
    ])
  })

  it('remote', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(listBranchesFsFixture as FsFixture)

    // act
    const commits = await listBranches({ fs, dir, remote: 'origin' })

    // assert
    expect(commits).to.have.members([
      "HEAD",
      "master",
    ])
  })
})
