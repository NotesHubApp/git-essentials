import { expect } from 'chai'

import { addRemote, Errors, listRemotes } from '../src'
import { makeFsFixture } from './helpers/makeFsFixture'

import gitFolderFixture from './fixtures/addRemote.json'
import { TreeEntriesDto } from '../src/clients/fs'


describe('addRemote', () => {
  it('addRemote', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture('test-addRemote', gitFolderFixture as TreeEntriesDto)
    const remote = 'baz'
    const url = 'git@github.com:baz/baz.git'

    // act
    await addRemote({ fs, dir, remote, url })

    // assert
    const actual = await listRemotes({ fs, dir })
    expect(actual).to.eql([
      { remote: 'foo', url: 'git@github.com:foo/foo.git' },
      { remote: 'bar', url: 'git@github.com:bar/bar.git' },
      { remote: 'baz', url: 'git@github.com:baz/baz.git' },
    ])
  })

  it('missing argument', async () => {
    // Setup
    const { fs, dir } = await makeFsFixture('test-addRemote')
    const remote = 'baz'
    const url = undefined as any
    // Test
    let error = null
    try {
      await addRemote({ fs, dir, remote, url })
    } catch (err: any) {
      error = err
    }
    expect(error).not.to.be.null
    expect(error.code).to.eq(Errors.MissingParameterError.code)
  })

  it('invalid remote name', async () => {
    // Setup
    const { fs, dir } = await makeFsFixture('test-addRemote')
    const remote = '@{HEAD~1}'
    const url = 'git@github.com:baz/baz.git'
    // Test
    let error = null
    try {
      await addRemote({ fs, dir, remote, url })
    } catch (err: any) {
      error = err
    }
    expect(error).not.to.be.null
    expect(error.code as any).to.eq(Errors.InvalidRefNameError.code)
  })
})
