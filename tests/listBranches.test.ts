import { expect } from 'chai'

import { listBranches } from '../src'
import { makeFsFixture, DataFixture } from './helpers/makeFsFixture'

import listBranchesDataFixture from './fixtures/data/listBranches.json'


describe('listBranches', () => {
  it('listBranches', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(listBranchesDataFixture as DataFixture)

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
    const { fs, dir } = await makeFsFixture(listBranchesDataFixture as DataFixture)

    // act
    const commits = await listBranches({ fs, dir, remote: 'origin' })

    // assert
    expect(commits).to.have.members([
      "HEAD",
      "master",
    ])
  })
})
