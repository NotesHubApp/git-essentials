import { expect } from 'chai'

import { clone } from '../src'
import { makeFsFixture } from './helpers/makeFsFixture'
import { makeHttpFixture, HttpFixtureData } from './helpers/makeHttpFixture'

import cloneHttpFixtureData from './fixtures/http/clone.json'

describe('clone', () => {
  it('clone --no-tags --signle-branch --depth 1', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)
    const url = 'https://github.com/NotesHubApp/Welcome.git'

    // act
    await clone({
      fs,
      http,
      dir,
      url,
      noTags: true,
      singleBranch: true,
      depth: 1
    })

    // assert
    expect(await fs.exists(`${dir}/.git`)).to.be.true
    expect(await fs.exists(`${dir}/Welcome note.md`)).to.be.true
  })
})