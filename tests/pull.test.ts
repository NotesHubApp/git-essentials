import { expect } from 'chai'

import { setConfig, pull, log, add, commit, Errors } from '../src'
import { setGitClientAgent } from '../src/utils/pkg'
import { FsFixtureData, makeFsFixture } from './helpers/makeFsFixture'
import { makeHttpFixture, HttpFixtureData } from './helpers/makeHttpFixture'

import pullFsFixtureData from './fixtures/fs/pull.json'
import pullNoFfFsFixtureData from './fixtures/fs/pull-no-ff.json'
import pullHttpFixtureData from './fixtures/http/pull.json'


describe('pull', () => {
  beforeEach(() => {
    setGitClientAgent('git/git-essentials')
  })

  it('pull', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pullFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pullHttpFixtureData as HttpFixtureData)

    // act
    let logs = await log({ fs, dir, ref: 'refs/heads/main' })

    // assert
    expect(logs.map(({ commit }) => commit.message)).to.eql([
      'Initial commit\n',
    ])

    // act
    await pull({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'refs/heads/main',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
    })

    logs = await log({ fs, dir, ref: 'refs/heads/main' })

    // assert
    expect(logs.map(({ commit }) => commit.message)).to.eql([
      'Added c.txt\n',
      'Added b.txt\n',
      'Initial commit\n',
    ])
  })

  it('pull fast-forward only', async () => {
    // arrange
    const author = {
      name: 'Mr. Test',
      email: 'mrtest@example.com',
      timestamp: 1262356920,
      timezoneOffset: -0,
    }

    const { fs, dir } = await makeFsFixture(pullNoFfFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pullHttpFixtureData as HttpFixtureData)

    // act
    await fs.writeFile(`${dir}/z.txt`, 'Hi')
    await add({ fs, dir, filepath: 'z.txt' })
    await commit({ fs, dir, message: 'Added z.txt', author })
    const logs = await log({ fs, dir, ref: 'refs/heads/main' })

    // assert
    expect(logs.map(({ commit }) => commit.message)).to.eql([
      'Added z.txt\n',
      'Initial commit\n',
    ])

    // act
    let err = null
    try {
      await pull({
        fs,
        http,
        dir,
        remote: 'origin',
        ref: 'refs/heads/main',
        fastForwardOnly: true,
        author: {
          name: 'Mr. Test',
          email: 'mrtest@example.com',
          timestamp: 1262356920,
          timezoneOffset: -0,
        },
      })
    } catch (e: any) {
      err = e
    }

    // assert
    expect(err.caller).to.eq('git.pull')
    expect(err.code).to.eq(Errors.FastForwardError.code)
  })
})
