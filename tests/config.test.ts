import { expect } from 'chai'

import { getConfig, getConfigAll, setConfig } from '../src'
import { makeFsFixture, FsFixture } from './helpers/makeFsFixture'

import configFsFixture from './fixtures/data/config.json'

describe('config', () => {
  it('getting', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(configFsFixture as FsFixture)

    // act
    const sym = await getConfig({ fs, dir, path: 'core.symlinks' })
    const rfv = await getConfig({ fs, dir, path: 'core.repositoryformatversion' })
    const url = await getConfig({ fs, dir, path: 'remote.origin.url' })
    const fetch = await getConfig({ fs, dir, path: 'remote.upstream.fetch' })
    const fetches = await getConfigAll({ fs, dir, path: 'remote.upstream.fetch' })

    // expect
    expect(sym).to.be.false
    expect(url).to.eq('https://github.com/isomorphic-git/isomorphic-git')
    expect(rfv).to.eq('0')
    expect(fetch).to.eq('refs/heads/qa/*:refs/remotes/upstream/qa/*')
    expect(fetches).to.eql([
      '+refs/heads/main:refs/remotes/upstream/main',
      'refs/heads/develop:refs/remotes/upstream/develop',
      'refs/heads/qa/*:refs/remotes/upstream/qa/*',
    ])
  })

  it('setting', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(configFsFixture as FsFixture)

    // act
    let bare: boolean | undefined

    // set to true
    await setConfig({ fs, dir, path: 'core.bare', value: true })
    bare = await getConfig({ fs, dir, path: 'core.bare' })
    expect(bare).to.be.true

    // set to false
    await setConfig({ fs, dir, path: 'core.bare', value: false })
    bare = await getConfig({ fs, dir, path: 'core.bare' })
    expect(bare).to.be.false

    // set to undefined
    await setConfig({ fs, dir, path: 'core.bare', value: undefined })
    bare = await getConfig({ fs, dir, path: 'core.bare' })
    expect(bare).to.be.undefined

    // change a remote
    await setConfig({ fs, dir, path: 'remote.origin.url', value: 'https://github.com/isomorphic-git/isomorphic-git' })
    const url = await getConfig({ fs, dir, path: 'remote.origin.url' })
    expect(url).to.eq('https://github.com/isomorphic-git/isomorphic-git')
  })
})
