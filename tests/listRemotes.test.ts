import { expect } from 'chai'

import { listRemotes } from '../src'
import { makeFsFixture, FsFixture } from './helpers/makeFsFixture'

import listRemotesFsFixture from './fixtures/data/listRemotes.json'


describe('listRemotes', () => {
  it('listRemotes', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(listRemotesFsFixture as FsFixture)

    // act
    const a = await listRemotes({ fs, dir })

    // assert
    expect(a).to.eql([
      { remote: 'foo', url: 'git@github.com:foo/foo.git' },
      { remote: 'bar', url: 'git@github.com:bar/bar.git' },
    ])
  })
})
