import { expect } from 'chai'

import { Errors, readCommit, commit, log } from '../src'
import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'
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
    expect(sha).to.eq('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // updates branch pointer
    const { oid: currentOid, commit: { parent } } = (await log({ fs, dir, depth: 1 }))[0]
    expect(parent).to.eql([originalOid])
    expect(currentOid).not.to.eq(originalOid)
    expect(currentOid).to.eq(sha)
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
    expect(sha).to.eq('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // does NOT update branch pointer
    const { oid: currentOid } = (await log({ fs, dir, depth: 1 }))[0]
    expect(currentOid).to.eq(originalOid)
    expect(currentOid).not.to.eq(sha)
    // but DID create commit object
    expect(await fs.exists(`${dir}/.git/objects/7a/51c0b1181d738198ff21c4679d3aa32eb52fe0`)).to.be.true
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
    expect(sha).to.eq('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // does NOT update branch pointer
    const { oid: currentOid } = (await log({ fs, dir, depth: 1 }))[0]
    expect(currentOid).to.eq(originalOid)
    expect(currentOid).not.to.eq(sha)
    // and did NOT create commit object
    expect(await fs.exists(`${dir}.git/objects/7a/51c0b1181d738198ff21c4679d3aa32eb52fe0`)).to.be.false
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
    expect(sha).to.eq('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // does NOT update main branch pointer
    const { oid: currentOid } = (await log({ fs, dir, depth: 1 }))[0]
    expect(currentOid).to.eq(originalOid)
    expect(currentOid).not.to.eq(sha)
    // but DOES update main-copy
    const { oid: copyOid } = (await log({ fs, dir, depth: 1, ref: 'main-copy' }))[0]
    expect(sha).to.eq(copyOid)
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
    expect(sha).to.eq('43fbc94f2c1db655a833e08c72d005954ff32f32')
    // does NOT update main branch pointer
    const { parent: parents, tree: _tree } = (await log({ fs, dir, depth: 1 }))[0].commit
    expect(parents).not.to.eql([originalOid])
    expect(parents).to.eql(parent)
    expect(_tree).to.eq(tree)
  })

  it('throw error if missing author', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(commitFsFixtureData as FsFixtureData)

    // act
    let error = null
    try {
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
    } catch (err: any) {
      error = err
    }

    // assert
    expect(error).not.to.be.null
    expect(error.code).to.eq(Errors.MissingNameError.code)
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
    expect(invalid).to.eql([])
    expect(valid).to.eql([keyId])
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
    expect(Object.is(commits[0].commit.author.timezoneOffset, -0)).to.be.true

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
    expect(Object.is(commits[0].commit.author.timezoneOffset, 0)).to.be.true

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
    expect(Object.is(commits[0].commit.author.timezoneOffset, 240)).to.be.true

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
    expect(Object.is(commits[0].commit.author.timezoneOffset, -240)).to.be.true
  })
})
