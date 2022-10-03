import { Errors, readCommit, commit, log } from 'git-essentials'

import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'
import { expectToFailWithTypeAsync } from './helpers/assertionHelper'
import { PgpMock } from './helpers/pgpMock'

import commitFsFixtureData from './fixtures/fs/commit.json'


describe('commit', () => {
  it('commit', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(commitFsFixtureData as FsFixtureData)
    const { oid: originalOid } = (await log({ fs, dir, depth: 1 }))[0]

    // act
    const sha = await commit({
      fs,
      dir,
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
      message: 'Initial commit',
    })

    // assert
    expect(sha).toBe('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // updates branch pointer
    const { oid: currentOid, commit: { parent } } = (await log({ fs, dir, depth: 1 }))[0]
    expect(parent).toEqual([originalOid])
    expect(currentOid).not.toBe(originalOid)
    expect(currentOid).toBe(sha)
  })

  it('without updating branch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(commitFsFixtureData as FsFixtureData)
    const { oid: originalOid } = (await log({ fs, dir, depth: 1 }))[0]

    // act
    const sha = await commit({
      fs,
      dir,
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
      message: 'Initial commit',
      noUpdateBranch: true,
    })

    // assert
    expect(sha).toBe('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // does NOT update branch pointer
    const { oid: currentOid } = (await log({ fs, dir, depth: 1 }))[0]
    expect(currentOid).toBe(originalOid)
    expect(currentOid).not.toBe(sha)
    // but DID create commit object
    expect(await fs.exists(`${dir}/.git/objects/7a/51c0b1181d738198ff21c4679d3aa32eb52fe0`)).toBe(true)
  })

  it('dry run', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(commitFsFixtureData as FsFixtureData)
    const { oid: originalOid } = (await log({ fs, dir, depth: 1 }))[0]

    // act
    const sha = await commit({
      fs,
      dir,
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
      message: 'Initial commit',
      dryRun: true,
    })

    // assert
    expect(sha).toBe('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // does NOT update branch pointer
    const { oid: currentOid } = (await log({ fs, dir, depth: 1 }))[0]
    expect(currentOid).toBe(originalOid)
    expect(currentOid).not.toBe(sha)
    // and did NOT create commit object
    expect(await fs.exists(`${dir}.git/objects/7a/51c0b1181d738198ff21c4679d3aa32eb52fe0`)).toBe(false)
  })

  it('custom ref', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(commitFsFixtureData as FsFixtureData)
    const { oid: originalOid } = (await log({ fs, dir, depth: 1 }))[0]

    // act
    const sha = await commit({
      fs,
      dir,
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
      message: 'Initial commit',
      ref: 'refs/heads/main-copy',
    })

    // assert
    expect(sha).toBe('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // does NOT update main branch pointer
    const { oid: currentOid } = (await log({ fs, dir, depth: 1 }))[0]
    expect(currentOid).toBe(originalOid)
    expect(currentOid).not.toBe(sha)
    // but DOES update main-copy
    const { oid: copyOid } = (await log({ fs, dir, depth: 1, ref: 'main-copy' }))[0]
    expect(sha).toBe(copyOid)
  })

  it('custom parents and tree', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(commitFsFixtureData as FsFixtureData)
    const { oid: originalOid } = (await log({ fs, dir, depth: 1 }))[0]
    const parent = [
      '1111111111111111111111111111111111111111',
      '2222222222222222222222222222222222222222',
      '3333333333333333333333333333333333333333',
    ]
    const tree = '4444444444444444444444444444444444444444'

    // act
    const sha = await commit({
      fs,
      dir,
      parent,
      tree,
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
      message: 'Initial commit',
    })

    // assert
    expect(sha).toBe('43fbc94f2c1db655a833e08c72d005954ff32f32')
    // does NOT update main branch pointer
    const { parent: parents, tree: _tree } = (await log({ fs, dir, depth: 1 }))[0].commit
    expect(parents).not.toEqual([originalOid])
    expect(parents).toEqual(parent)
    expect(_tree).toBe(tree)
  })

  it('throw error if missing author', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(commitFsFixtureData as FsFixtureData)

    // act
    const action = async () => {
      await commit({
        fs,
        dir,
        // @ts-ignore
        author: {
          email: 'mrtest@example.com',
          timestamp: 1262356920,
          timezoneOffset: 0,
        },
        message: 'Initial commit',
      })
    }

    // assert
    await expectToFailWithTypeAsync(action, Errors.MissingNameError)
  })

  it('create signed commit', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(commitFsFixtureData as FsFixtureData)
    const privateKey = 'privatekey123'
    const publicKey = 'publickey123'
    const keyId = 'f2f0ced8a52613c4'
    const pgp = new PgpMock(publicKey, keyId)

    // act
    const oid = await commit({
      fs,
      dir,
      message: 'Initial commit',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1504842425,
        timezoneOffset: 0,
      },
      signingKey: privateKey,
      onSign: (params) => pgp.sign(params),
    })

    // assert
    const { commit: commitObject, payload } = await readCommit({ fs, dir, oid })
    const { valid, invalid } = await pgp.verify({ payload, publicKey, signature: commitObject.gpgsig })
    expect(invalid).toEqual([])
    expect(valid).toEqual([keyId])
  })

  it('with timezone', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(commitFsFixtureData as FsFixtureData)

    // act
    await commit({
      fs,
      dir,
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
      message: '-0 offset',
    })

    // assert
    let commits = await log({ fs, dir, depth: 1 })
    expect(Object.is(commits[0].commit.author.timezoneOffset, -0)).toBe(true)

    // act
    await commit({
      fs,
      dir,
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: 0,
      },
      message: '+0 offset',
    })

    // assert
    commits = await log({ fs, dir, depth: 1 })
    expect(Object.is(commits[0].commit.author.timezoneOffset, 0)).toBe(true)

    // act
    await commit({
      fs,
      dir,
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: 240,
      },
      message: '+240 offset',
    })

    // assert
    commits = await log({ fs, dir, depth: 1 })
    expect(Object.is(commits[0].commit.author.timezoneOffset, 240)).toBe(true)

    // act
    await commit({
      fs,
      dir,
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -240,
      },
      message: '-240 offset',
    })

    // assert
    commits = await log({ fs, dir, depth: 1 })
    expect(Object.is(commits[0].commit.author.timezoneOffset, -240)).toBe(true)
  })
})
