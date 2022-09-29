import { pull, log, add, commit, Errors } from '../src'
import { setGitClientAgent } from '../src/utils/pkg'
import { FsFixtureData, makeFsFixture } from './helpers/makeFsFixture'
import { makeHttpFixture, HttpFixtureData } from './helpers/makeHttpFixture'
import { expectToFailWithTypeAsync } from './helpers/assertionHelper'

import pullFsFixtureData from './fixtures/fs/pull.json'
import pullNoFfFsFixtureData from './fixtures/fs/pull-no-ff.json'
import pullHttpFixtureData from './fixtures/http/pull.json'


describe('pull', () => {
  beforeEach(() => {
    // The default agent string is version depended.
    // We need to set version independent variant to make sure HttpFixtures will work.
    setGitClientAgent('git/git-essentials')
  })

  it('pull', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pullFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pullHttpFixtureData as HttpFixtureData)

    // act
    let logs = await log({ fs, dir, ref: 'refs/heads/main' })

    // assert
    expect(logs.map(({ commit }) => commit.message)).toEqual([
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
    expect(logs.map(({ commit }) => commit.message)).toEqual([
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
    expect(logs.map(({ commit }) => commit.message)).toEqual([
      'Added z.txt\n',
      'Initial commit\n',
    ])

    // act
    const action = async () => {
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
    }

    // assert
    await expectToFailWithTypeAsync(action, Errors.FastForwardError)
  })

  it('pull no fast-forward', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pullNoFfFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pullHttpFixtureData as HttpFixtureData)

    // act
    let logs = await log({ fs, dir, ref: 'refs/heads/main' })
    expect(logs.map(({ commit }) => commit.message)).toEqual([
      'Initial commit\n',
    ])

    await pull({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'refs/heads/main',
      fastForward: false,
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
    })

    logs = await log({ fs, dir, ref: 'refs/heads/main' })
    const formattedLogs = logs.map(
      ({ commit }) => `${commit.message} (${commit.parent.join(' ')})`
    )

    // assert
    expect(formattedLogs).toEqual([
      "Merge branch 'main' of http://localhost/pull-server.git\n (5a8905a02e181fe1821068b8c0f48cb6633d5b81 97c024f73eaab2781bf3691597bc7c833cb0e22f)",
      'Added c.txt\n (c82587c97be8f9a10088590e06c9d0f767ed5c4a)',
      'Added b.txt\n (5a8905a02e181fe1821068b8c0f48cb6633d5b81)',
      'Initial commit\n ()',
    ])
  })
})
