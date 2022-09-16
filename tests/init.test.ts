import { expect } from 'chai'

import { init, setConfig, getConfig } from '../src'
import { makeFsFixture } from './helpers/makeFsFixture';


describe('init', () => {
  it('init', async () => {
    // arrange
    const { dir, fs } = await makeFsFixture('init')

    // act
    await init({ dir, fs })

    // assert
    expect(await fs.exists(dir)).to.be.true
    expect(await fs.exists(`${dir}/.git/objects`)).to.be.true
    expect(await fs.exists(`${dir}/.git/refs/heads`)).to.be.true
    expect(await fs.exists(`${dir}/.git/HEAD`)).to.be.true
  })

  it('init --bare', async () => {
    // arrange
    const { dir, fs } = await makeFsFixture('init')

    // act
    await init({ fs, dir, bare: true })

    // assert
    expect(await fs.exists(dir)).to.be.true
    expect(await fs.exists(`${dir}/objects`)).to.be.true
    expect(await fs.exists(`${dir}/refs/heads`)).to.be.true
    expect(await fs.exists(`${dir}/HEAD`)).to.be.true
  })

  it('init does not overwrite existing config', async () => {
    // arrange
    const { dir, fs } = await makeFsFixture('init')
    const name = 'me'
    const email = 'meme'
    await init({ fs, dir })
    expect(await fs.exists(dir)).to.be.true
    expect(await fs.exists(`${dir}/.git/config`)).to.be.true
    await setConfig({ fs, dir, path: 'user.name', value: name })
    await setConfig({ fs, dir, path: 'user.email', value: email })

    // act
    await init({ fs, dir })

    // assert
    expect(await fs.exists(dir)).to.be.true
    expect(await fs.exists(`${dir}/.git/config`)).to.be.true
    // check that the properties we added are still there.
    expect(await getConfig({ fs, dir, path: 'user.name' })).to.eq(name)
    expect(await getConfig({ fs, dir, path: 'user.email' })).to.eq(email)
  })
});
