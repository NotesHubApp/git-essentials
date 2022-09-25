import { init, setConfig, getConfig } from '../src'
import { makeFsFixture } from './helpers/makeFsFixture'


describe('init', () => {
  it('init', async () => {
    // arrange
    const { dir, fs } = await makeFsFixture()

    // act
    await init({ dir, fs })

    // assert
    expect(await fs.exists(dir)).toBe(true)
    expect(await fs.exists(`${dir}/.git/objects`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/refs/heads`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/HEAD`)).toBe(true)
  })

  it('init --bare', async () => {
    // arrange
    const { dir, fs } = await makeFsFixture()

    // act
    await init({ fs, dir, bare: true })

    // assert
    expect(await fs.exists(dir)).toBe(true)
    expect(await fs.exists(`${dir}/objects`)).toBe(true)
    expect(await fs.exists(`${dir}/refs/heads`)).toBe(true)
    expect(await fs.exists(`${dir}/HEAD`)).toBe(true)
  })

  it('init does not overwrite existing config', async () => {
    // arrange
    const { dir, fs } = await makeFsFixture()
    const name = 'me'
    const email = 'meme'
    await init({ fs, dir })
    expect(await fs.exists(dir)).toBe(true)
    expect(await fs.exists(`${dir}/.git/config`)).toBe(true)
    await setConfig({ fs, dir, path: 'user.name', value: name })
    await setConfig({ fs, dir, path: 'user.email', value: email })

    // act
    await init({ fs, dir })

    // assert
    expect(await fs.exists(dir)).toBe(true)
    expect(await fs.exists(`${dir}/.git/config`)).toBe(true)
    // check that the properties we added are still there.
    expect(await getConfig({ fs, dir, path: 'user.name' })).toBe(name)
    expect(await getConfig({ fs, dir, path: 'user.email' })).toBe(email)
  })
});
