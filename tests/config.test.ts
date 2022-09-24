import { getConfig, getConfigAll, setConfig } from '../src'
import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'

import configFsFixtureData from './fixtures/fs/config.json'

describe('config', () => {
  it('getting', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(configFsFixtureData as FsFixtureData)

    // act
    const sym = await getConfig({ fs, dir, path: 'core.symlinks' })
    const rfv = await getConfig({ fs, dir, path: 'core.repositoryformatversion' })
    const url = await getConfig({ fs, dir, path: 'remote.origin.url' })
    const fetch = await getConfig({ fs, dir, path: 'remote.upstream.fetch' })
    const fetches = await getConfigAll({ fs, dir, path: 'remote.upstream.fetch' })

    // expect
    expect(sym).toBe(false)
    expect(url).toBe('https://github.com/isomorphic-git/isomorphic-git')
    expect(rfv).toBe('0')
    expect(fetch).toBe('refs/heads/qa/*:refs/remotes/upstream/qa/*')
    expect(fetches).toEqual([
      '+refs/heads/main:refs/remotes/upstream/main',
      'refs/heads/develop:refs/remotes/upstream/develop',
      'refs/heads/qa/*:refs/remotes/upstream/qa/*',
    ])
  })

  it('setting', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(configFsFixtureData as FsFixtureData)

    // act
    let bare: boolean | undefined

    // set to true
    await setConfig({ fs, dir, path: 'core.bare', value: true })
    bare = await getConfig({ fs, dir, path: 'core.bare' })
    expect(bare).toBe(true)

    // set to false
    await setConfig({ fs, dir, path: 'core.bare', value: false })
    bare = await getConfig({ fs, dir, path: 'core.bare' })
    expect(bare).toBe(false)

    // set to undefined
    await setConfig({ fs, dir, path: 'core.bare', value: undefined })
    bare = await getConfig({ fs, dir, path: 'core.bare' })
    expect(bare).toBeUndefined()

    // change a remote
    await setConfig({ fs, dir, path: 'remote.origin.url', value: 'https://github.com/isomorphic-git/isomorphic-git' })
    const url = await getConfig({ fs, dir, path: 'remote.origin.url' })
    expect(url).toBe('https://github.com/isomorphic-git/isomorphic-git')
  })
})
