import { expect } from 'chai'

import { resolveRef } from '../src'
import { makeFsFixture, FsFixture } from './helpers/makeFsFixture'

import resolveRefFsFixture from './fixtures/data/resolveRef.json'


describe('resolveRef', () => {
  it('1e40fdfba1cf17f3c9f9f3d6b392b1865e5147b9', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixture as FsFixture)

    // act
    const ref = await resolveRef({ fs, dir, ref: '1e40fdfba1cf17f3c9f9f3d6b392b1865e5147b9' })

    // assert
    expect(ref).to.eq('1e40fdfba1cf17f3c9f9f3d6b392b1865e5147b9')
  })

  it('test-branch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixture as FsFixture)

    // act
    const ref = await resolveRef({ fs, dir, ref: 'origin/test-branch' })

    // assert
    expect(ref).to.eq('e10ebb90d03eaacca84de1af0a59b444232da99e')
  })

  it('config', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixture as FsFixture)

    // act
    const ref = await resolveRef({ fs, dir, ref: 'config' })

    // assert
    expect(ref).to.eq('e10ebb90d03eaacca84de1af0a59b444232da99e')
  })

  it('test-tag', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixture as FsFixture)

    // act
    const ref = await resolveRef({ fs, dir, ref: 'test-tag' })

    // assert
    expect(ref).to.eq('1e40fdfba1cf17f3c9f9f3d6b392b1865e5147b9')
  })

  it('HEAD', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixture as FsFixture)

    // act
    const ref = await resolveRef({ fs, dir, ref: 'HEAD' })

    // assert
    expect(ref).to.eq('033417ae18b174f078f2f44232cb7a374f4c60ce')
  })

  it('HEAD depth', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixture as FsFixture)

    // act
    const ref = await resolveRef({ fs, dir, ref: 'HEAD', depth: 2 })

    // assert
    expect(ref).to.eq('refs/heads/main')
  })

  it('packed-refs', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixture as FsFixture)

    // act
    const ref = await resolveRef({ fs, dir, ref: 'v0.0.1' })

    // assert
    expect(ref).to.eq('1a2149e96a9767b281a8f10fd014835322da2d14')
  })

  it('non-existant refs', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(resolveRefFsFixture as FsFixture)

    // act
    let error: { message?: string, caller?: string } = {}
    try {
      await resolveRef({ fs, dir, ref: 'this-is-not-a-ref' })
    } catch (err: any) {
      error = err
    }

    // assert
    expect(error.message).not.to.be.undefined
    expect(error.caller).to.eq('git.resolveRef')
  })
})
