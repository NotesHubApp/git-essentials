import {describe, expect, it} from '@jest/globals'

import { init, setConfig, getConfig } from '../src'
import { makeFsFixture } from './helpers/makeFsFixture';

describe('init', () => {
  it('init', async () => {
    // arrange
    const { dir, fsClient, fs } = await makeFsFixture('test-init')

    // act
    await init({ dir, fs: fsClient })

    // assert
    expect(await fs.exists(dir)).toBe(true)
    expect(await fs.exists(`${dir}/.git/objects`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/refs/heads`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/HEAD`)).toBe(true)
  })

  it('init --bare', async () => {
    // arrange
    const { dir, fsClient, fs } = await makeFsFixture('test-init')

    // act
    await init({ fs: fsClient, dir, bare: true })

    // assert
    expect(await fs.exists(dir)).toBe(true)
    expect(await fs.exists(`${dir}/objects`)).toBe(true)
    expect(await fs.exists(`${dir}/refs/heads`)).toBe(true)
    expect(await fs.exists(`${dir}/HEAD`)).toBe(true)
  })

  it('init does not overwrite existing config', async () => {
    // arrange
    const { dir, fs, fsClient } = await makeFsFixture('test-init')
    const name = 'me'
    const email = 'meme'
    await init({ fs: fsClient, dir })
    expect(await fs.exists(dir)).toBe(true)
    expect(await fs.exists(`${dir}/.git/config`)).toBe(true)
    await setConfig({ fs: fsClient, dir, path: 'user.name', value: name })
    await setConfig({ fs: fsClient, dir, path: 'user.email', value: email })

    // act
    await init({ fs: fsClient, dir })

    // assert
    expect(await fs.exists(dir)).toBe(true)
    expect(await fs.exists(`${dir}/.git/config`)).toBe(true)
    // check that the properties we added are still there.
    expect(await getConfig({ fs: fsClient, dir, path: 'user.name' })).toEqual(name)
    expect(await getConfig({ fs: fsClient, dir, path: 'user.email' })).toEqual(email)
  })
});
