import { init, add, listFiles } from 'git-essentials'

import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'
import { expectToFailAsync } from './helpers/assertionHelper'

import addFsFixtureData from './fixtures/fs/add.json'


describe('add', () => {
  it('file', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(addFsFixtureData as FsFixtureData)

    // act
    await init({ fs, dir })
    await add({ fs, dir, filepath: 'a.txt' })
    // assert
    expect((await listFiles({ fs, dir })).length).toBe(1)

    // act
    await add({ fs, dir, filepath: 'a.txt' })
    // assert
    expect((await listFiles({ fs, dir })).length).toBe(1)

    // act
    await add({ fs, dir, filepath: 'a-copy.txt' })
    // assert
    expect((await listFiles({ fs, dir })).length).toBe(2)

    // act
    await add({ fs, dir, filepath: 'b.txt' })
    // assert
    expect((await listFiles({ fs, dir })).length).toBe(3)
  })

  it('ignored file', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(addFsFixtureData as FsFixtureData)

    // act
    await init({ fs, dir })
    await add({ fs, dir, filepath: 'i.txt' })

    // assert
    expect((await listFiles({ fs, dir })).length).toBe(0)
  })

  it('non-existant file', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(addFsFixtureData as FsFixtureData)

    // act
    await init({ fs, dir })

    const action = async () => {
      await add({ fs, dir, filepath: 'asdf.txt' })
    }

    // assert
    await expectToFailAsync(action, (err) => err.caller === 'git.add')
  })

  it('folder', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(addFsFixtureData as FsFixtureData)
    await fs.rm(`${dir}/.gitignore`)

    // act
    await init({ fs, dir })
    // assert
    expect((await listFiles({ fs, dir })).length).toBe(0)

    // act
    await add({ fs, dir, filepath: 'c' })
    // assert
    expect((await listFiles({ fs, dir })).length).toBe(4)
  })

  it('folder with .gitignore', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(addFsFixtureData as FsFixtureData)

    // act
    await init({ fs, dir })
    // assert
    expect((await listFiles({ fs, dir })).length).toBe(0)

    // act
    await add({ fs, dir, filepath: 'c' })
    // assert
    expect((await listFiles({ fs, dir })).length).toBe(3)
  })

  it('git add .', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(addFsFixtureData as FsFixtureData)

    // act
    await init({ fs, dir })
    // assert
    expect((await listFiles({ fs, dir })).length).toBe(0)

    // act
    await add({ fs, dir, filepath: '.' })
    // assert
    expect((await listFiles({ fs, dir })).length).toBe(7)
  })
})
