import { expect } from 'chai'

import { listRemotes } from '../src'
import { makeFsFixture, DataFixture } from './helpers/makeFsFixture'

import listRemotesDataFixture from './fixtures/data/listRemotes.json'


describe('listRemotes', () => {
  it('listRemotes', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(listRemotesDataFixture as DataFixture)

    // act
    const a = await listRemotes({ fs, dir })

    // assert
    expect(a).to.eql([
      { remote: 'foo', url: 'git@github.com:foo/foo.git' },
      { remote: 'bar', url: 'git@github.com:bar/bar.git' },
    ])
  })
})
