import { expect } from 'chai'

import { Errors, readCommit, commit, log } from '../src'
import { makeFsFixture, DataFixture } from './helpers/makeFsFixture'

import commitDataFixture from './fixtures/data/commit.json'

describe('commit', () => {
  it('commit', async () => {
    // Setup
    const { fs, dir } = await makeFsFixture(commitDataFixture as DataFixture)
    const { oid: originalOid } = (await log({ fs, dir, depth: 1 }))[0]
    // Test
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
    expect(sha).to.eq('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // updates branch pointer
    const {
      oid: currentOid,
      commit: { parent },
    } = (await log({ fs, dir, depth: 1 }))[0]
    expect(parent).to.eql([originalOid])
    expect(currentOid).not.to.eq(originalOid)
    expect(currentOid).to.eq(sha)
  })

  it('without updating branch', async () => {
    // Setup
    const { fs, dir } = await makeFsFixture(commitDataFixture as DataFixture)
    const { oid: originalOid } = (await log({ fs, dir, depth: 1 }))[0]
    // Test
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
    expect(sha).to.eq('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // does NOT update branch pointer
    const { oid: currentOid } = (await log({ fs, dir, depth: 1 }))[0]
    expect(currentOid).to.eq(originalOid)
    expect(currentOid).not.to.eq(sha)
    // but DID create commit object
    expect(await fs.exists(`${dir}/.git/objects/7a/51c0b1181d738198ff21c4679d3aa32eb52fe0`)).to.be.true
  })

  it('dry run', async () => {
    // Setup
    const { fs, dir } = await makeFsFixture(commitDataFixture as DataFixture)
    const { oid: originalOid } = (await log({ fs, dir, depth: 1 }))[0]
    // Test
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
    expect(sha).to.eq('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // does NOT update branch pointer
    const { oid: currentOid } = (await log({ fs, dir, depth: 1 }))[0]
    expect(currentOid).to.eq(originalOid)
    expect(currentOid).not.to.eq(sha)
    // and did NOT create commit object
    expect(await fs.exists(`${dir}.git/objects/7a/51c0b1181d738198ff21c4679d3aa32eb52fe0`)).to.be.false
  })

  it('custom ref', async () => {
    // Setup
    const { fs, dir } = await makeFsFixture(commitDataFixture as DataFixture)
    const { oid: originalOid } = (await log({ fs, dir, depth: 1 }))[0]
    // Test
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
      ref: 'refs/heads/master-copy',
    })
    expect(sha).to.eq('7a51c0b1181d738198ff21c4679d3aa32eb52fe0')
    // does NOT update master branch pointer
    const { oid: currentOid } = (await log({ fs, dir, depth: 1 }))[0]
    expect(currentOid).to.eq(originalOid)
    expect(currentOid).not.to.eq(sha)
    // but DOES update master-copy
    const { oid: copyOid } = (
      await log({ fs, dir, depth: 1, ref: 'master-copy' })
    )[0]
    expect(sha).to.eq(copyOid)
  })

  it('custom parents and tree', async () => {
    // Setup
    const { fs, dir } = await makeFsFixture(commitDataFixture as DataFixture)
    const { oid: originalOid } = (await log({ fs, dir, depth: 1 }))[0]
    // Test
    const parent = [
      '1111111111111111111111111111111111111111',
      '2222222222222222222222222222222222222222',
      '3333333333333333333333333333333333333333',
    ]
    const tree = '4444444444444444444444444444444444444444'
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
    expect(sha).to.eq('43fbc94f2c1db655a833e08c72d005954ff32f32')
    // does NOT update master branch pointer
    const { parent: parents, tree: _tree } = (
      await log({
        fs,
        dir,
        depth: 1,
      })
    )[0].commit
    expect(parents).not.to.eql([originalOid])
    expect(parents).to.eql(parent)
    expect(_tree).to.eq(tree)
  })

  it('throw error if missing author', async () => {
    // Setup
    const { fs, dir } = await makeFsFixture(commitDataFixture as DataFixture)
    // Test
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
    expect(error).not.to.be.null
    expect(error.code).to.eq(Errors.MissingNameError.code)
  })

  it('create signed commit', async () => {
    // Setup
    const { pgp } = require('@isomorphic-git/pgp-plugin')
    const { fs, dir } = await makeFsFixture(commitDataFixture as DataFixture)
    // Test
    const { privateKey, publicKey } = require('./__fixtures__/pgp-keys.js')
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
      onSign: pgp.sign,
    })
    const { commit: commitObject, payload } = await readCommit({ fs, dir, oid })
    const { valid, invalid } = await pgp.verify({
      payload,
      publicKey,
      signature: commitObject.gpgsig,
    })
    expect(invalid).to.eql([])
    expect(valid).to.eql(['f2f0ced8a52613c4'])
  })

  it('with timezone', async () => {
    // Setup
    const { fs, dir } = await makeFsFixture(commitDataFixture as DataFixture)
    let commits
    // Test
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
    commits = await log({ fs, dir, depth: 1 })
    expect(Object.is(commits[0].commit.author.timezoneOffset, -0)).to.be.true

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
    commits = await log({ fs, dir, depth: 1 })
    expect(Object.is(commits[0].commit.author.timezoneOffset, 0)).to.be.true

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
    commits = await log({ fs, dir, depth: 1 })
    expect(Object.is(commits[0].commit.author.timezoneOffset, 240)).to.be.true

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
    commits = await log({ fs, dir, depth: 1 })
    expect(Object.is(commits[0].commit.author.timezoneOffset, -240)).to.be.true
  })
})
