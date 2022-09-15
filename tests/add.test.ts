import { expect } from 'chai'

import { init, add, listFiles } from '../src'
import { TreeEntriesDto } from '../src/clients/fs'
import { makeFsFixture } from './helpers/makeFsFixture'

import dataFixture from './fixtures/add.json'


describe('add', () => {
  it('file', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture('test-add', dataFixture as TreeEntriesDto)

    // act
    await init({ fs, dir })
    await add({ fs, dir, filepath: 'a.txt' })
    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(1)

    // act
    await add({ fs, dir, filepath: 'a.txt' })
    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(1)

    // act
    await add({ fs, dir, filepath: 'a-copy.txt' })
    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(2)

    // act
    await add({ fs, dir, filepath: 'b.txt' })
    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(3)
  })

  it('ignored file', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture('test-add', dataFixture as TreeEntriesDto)

    // act
    await init({ fs, dir })
    await add({ fs, dir, filepath: 'i.txt' })

    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(0)
  })

  it('non-existant file', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture('test-add', dataFixture as TreeEntriesDto)

    // act
    await init({ fs, dir })
    let err = null

    try {
      await add({ fs, dir, filepath: 'asdf.txt' })
    } catch (e: any) {
      err = e
    }

    // assert
    expect(err.caller).to.eq('git.add')
  })

  it('folder', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture('test-add', dataFixture as TreeEntriesDto)
    await fs.unlink(`${dir}/.gitignore`)

    // act
    await init({ fs, dir })
    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(0)

    // act
    await add({ fs, dir, filepath: 'c' })
    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(4)
  })

  it('folder with .gitignore', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture('test-add', dataFixture as TreeEntriesDto)

    // act
    await init({ fs, dir })
    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(0)

    // act
    await add({ fs, dir, filepath: 'c' })
    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(3)
  })

  it('git add .', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture('test-add', dataFixture as TreeEntriesDto)

    // act
    await init({ fs, dir })
    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(0)

    // act
    await add({ fs, dir, filepath: '.' })
    // assert
    expect((await listFiles({ fs, dir })).length).to.eq(7)
  })
})
