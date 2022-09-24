import { listRemotes } from '../src'
import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'

import listRemotesFsFixtureData from './fixtures/fs/listRemotes.json'


describe('listRemotes', () => {
  it('listRemotes', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(listRemotesFsFixtureData as FsFixtureData)

    // act
    const a = await listRemotes({ fs, dir })

    // assert
    expect(a).toEqual([
      { remote: 'foo', url: 'git@github.com:foo/foo.git' },
      { remote: 'bar', url: 'git@github.com:bar/bar.git' },
    ])
  })
})
