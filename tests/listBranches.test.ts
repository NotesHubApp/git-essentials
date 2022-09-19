import { expect } from 'chai'

import { listBranches } from '../src'
import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'

import listBranchesFsFixtureData from './fixtures/fs/listBranches.json'


describe('listBranches', () => {
  it('listBranches', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(listBranchesFsFixtureData as FsFixtureData)

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
    const { fs, dir } = await makeFsFixture(listBranchesFsFixtureData as FsFixtureData)

    // act
    const commits = await listBranches({ fs, dir, remote: 'origin' })

    // assert
    expect(commits).to.have.members([
      "HEAD",
      "master",
    ])
  })
})
