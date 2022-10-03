import { addRemote, Errors, listRemotes } from 'git-essentials'
import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'
import { expectToFailWithTypeAsync } from './helpers/assertionHelper'

import addRemoteFsFixtureData from './fixtures/fs/addRemote.json'


describe('addRemote', () => {
  it('addRemote', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(addRemoteFsFixtureData as FsFixtureData)
    const remote = 'baz'
    const url = 'git@github.com:baz/baz.git'

    // act
    await addRemote({ fs, dir, remote, url })

    // assert
    const actual = await listRemotes({ fs, dir })
    expect(actual).toEqual([
      { remote: 'foo', url: 'git@github.com:foo/foo.git' },
      { remote: 'bar', url: 'git@github.com:bar/bar.git' },
      { remote: 'baz', url: 'git@github.com:baz/baz.git' },
    ])
  })

  it('missing argument', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(addRemoteFsFixtureData as FsFixtureData)
    const remote = 'baz'
    const url = undefined as any

    // act
    const action = async () => {
      await addRemote({ fs, dir, remote, url })
    }

    // assert
    await expectToFailWithTypeAsync(action, Errors.MissingParameterError)
  })

  it('invalid remote name', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(addRemoteFsFixtureData as FsFixtureData)
    const remote = '@{HEAD~1}'
    const url = 'git@github.com:baz/baz.git'

    // act
    const action = async () => {
      await addRemote({ fs, dir, remote, url })
    }

    // assert
    await expectToFailWithTypeAsync(action, Errors.InvalidRefNameError)
  })
})
