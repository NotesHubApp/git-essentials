import { expect } from 'chai'

import { getConfig, getConfigAll, setConfig } from '../src'
import { makeFsFixture, DataFixture } from './helpers/makeFsFixture'

import configDataFixture from './fixtures/data/config.json'

describe('config', () => {
  it('getting', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(configDataFixture as DataFixture)

    // Test
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
      '+refs/heads/master:refs/remotes/upstream/master',
      'refs/heads/develop:refs/remotes/upstream/develop',
      'refs/heads/qa/*:refs/remotes/upstream/qa/*',
    ])
  })

  it('setting', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(configDataFixture as DataFixture)

    // act
    let bare

    // set to true
    await setConfig({ fs, dir, path: 'core.bare', value: true as any })
    bare = await getConfig({ fs, dir, path: 'core.bare' })
    expect(bare).to.be.true

    // set to false
    await setConfig({ fs, dir, path: 'core.bare', value: false as any })
    bare = await getConfig({ fs, dir, path: 'core.bare' })
    expect(bare).to.be.false

    // set to undefined
    await setConfig({ fs, dir, path: 'core.bare', value: undefined as any })
    bare = await getConfig({ fs, dir, path: 'core.bare' })
    expect(bare).to.be.undefined

    // change a remote
    await setConfig({ fs, dir, path: 'remote.origin.url', value: 'https://github.com/isomorphic-git/isomorphic-git' })
    const url = await getConfig({ fs, dir, path: 'remote.origin.url' })
    expect(url).to.eq('https://github.com/isomorphic-git/isomorphic-git')
  })
})
