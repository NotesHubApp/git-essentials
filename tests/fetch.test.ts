import { fetch, setConfig } from 'git-essentials'
import { setGitClientAgent } from 'git-essentials/utils/pkg'
import { UnknownTransportError, NoRefspecError } from 'git-essentials/errors'

import { FsFixtureData, makeFsFixture } from './helpers/makeFsFixture'
import { makeHttpFixture, HttpFixtureData } from './helpers/makeHttpFixture'
import { expectToFailAsync, expectToFailWithTypeAsync } from './helpers/assertionHelper'

import emptyFsFixtureData from './fixtures/fs/empty.json'
import fetchFsFixtureData from './fixtures/fs/fetch.json'
import fetchEmptyRepoFsFixtureData from './fixtures/fs/fetch-empty-repo.json'
import fetchMissingRefspecFsFixtureData from './fixtures/fs/fetch-missing-refspec.json'
import fetchHttpFixtureData from './fixtures/http/fetch.json'


describe('fetch', () => {
  beforeEach(() => {
    // The default agent string is version depended.
    // We need to set version independent variant to make sure HttpFixtures will work.
    setGitClientAgent('git/git-essentials')
  })

  it('fetch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchEmptyRepoFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    await fetch({
      fs,
      http,
      dir,
      singleBranch: true,
      remote: 'origin',
      ref: 'test',
    })

    // assert
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/test`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/main`)).toBe(false)
  })

  it('shallow fetch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchEmptyRepoFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)
    const output: string[] = []
    const progress: any[] = []

    // act
    await fetch({
      fs,
      http,
      dir,
      onMessage: async x => {
        output.push(x)
      },
      onProgress: async y => {
        progress.push(y)
      },
      depth: 1,
      singleBranch: true,
      remote: 'origin',
      ref: 'main',
    })

    // assert
    expect(await fs.exists(`${dir}/.git/shallow`)).toBe(true)
    expect(output[output.length - 1].split(' ')[1]).toBe('5')
    let shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
    expect(shallow).toBe('97c024f73eaab2781bf3691597bc7c833cb0e22f\n')

    // act
    await fetch({
      fs,
      http,
      dir,
      depth: 2,
      singleBranch: true,
      remote: 'origin',
      ref: 'main',
    })

    // assert
    shallow = (await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' }))
    expect(shallow).toBe('c82587c97be8f9a10088590e06c9d0f767ed5c4a\n')
  })

  it('throws UnknownTransportError if using shorter scp-like syntax', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchEmptyRepoFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    const action = async () => {
      await fetch({
        fs,
        http,
        dir,
        depth: 1,
        singleBranch: true,
        remote: 'ssh',
        ref: 'main',
      })
    }

    // assert
    await expectToFailWithTypeAsync(action, UnknownTransportError)
  })

  it('the SSH -> HTTPS UnknownTransportError suggestion feature', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchEmptyRepoFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    const action = async () => {
      await fetch({
        fs,
        http,
        dir,
        depth: 1,
        singleBranch: true,
        remote: 'ssh',
        ref: 'main',
      })
    }

    // assert
    await expectToFailAsync(action, (err) =>
      err instanceof UnknownTransportError &&
      err.data.suggestion === 'https://localhost/fetch-server.git'
    )
  })

  it('shallow fetch single commit by hash', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchEmptyRepoFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    await fetch({
      fs,
      http,
      dir,
      singleBranch: true,
      remote: 'origin',
      depth: 1,
      ref: '5a8905a02e181fe1821068b8c0f48cb6633d5b81',
    })

    // assert
    expect(await fs.exists(`${dir}/.git/shallow`)).toBe(true)
    const shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
    expect(shallow).toBe('5a8905a02e181fe1821068b8c0f48cb6633d5b81\n')
  })

  it('shallow fetch since', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchEmptyRepoFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)
    await setConfig({ fs, dir, path: 'remote.origin.url', value: 'https://github.com/NotesHubApp/Welcome.git' })

    // act
    await fetch({
      fs,
      http,
      dir,
      since: new Date(1661478727000), // 2022-7-25 18:52:7
      singleBranch: true,
      remote: 'origin',
      ref: 'main'
    })

    // assert
    expect(await fs.exists(`${dir}/.git/shallow`)).toBe(true)
    const shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
    expect(shallow).toBe('76eb4d63a0f172b5d4a0e46daadedd8b3e144773\n')
  })

  it('shallow fetch exclude', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchEmptyRepoFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    await fetch({
      fs,
      http,
      dir,
      exclude: ['test'],
      singleBranch: false,
      remote: 'origin',
      ref: 'main',
    })

    // assert
    expect(await fs.exists(`${dir}/.git/shallow`)).toBe(true)
    const shallow = (await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' }))
    expect(shallow).toBe('c82587c97be8f9a10088590e06c9d0f767ed5c4a\n')
  })

  it('shallow fetch relative', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchEmptyRepoFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    await fetch({
      fs,
      http,
      dir,
      depth: 1,
      singleBranch: true,
      remote: 'origin',
      ref: 'main',
    })

    // assert
    expect(await fs.exists(`${dir}/.git/shallow`)).toBe(true)
    let shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
    expect(shallow).toBe('97c024f73eaab2781bf3691597bc7c833cb0e22f\n')

    // act (now test deepen)
    await fetch({
      fs,
      http,
      dir,
      relative: true,
      depth: 1,
      singleBranch: true,
      remote: 'origin',
      ref: 'main',
    })

    // assert
    shallow = (await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' }))
    expect(shallow).toBe('c82587c97be8f9a10088590e06c9d0f767ed5c4a\n')
  })

  it('errors if missing refspec', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchMissingRefspecFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    const action = async () => {
      await fetch({
        fs,
        http,
        dir,
        singleBranch: true,
        depth: 1,
        remote: 'origin',
        ref: 'main',
      })
    }

    // assert
    await expectToFailWithTypeAsync(action, NoRefspecError)
  })


  it('fetch empty repository', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(emptyFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    await fetch({
      fs,
      http,
      dir,
      depth: 1,
      url: `http://localhost/empty.git`,
    })

    // assert
    expect(await fs.exists(`${dir}`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/HEAD`)).toBe(true)
    expect((<string>await fs.readFile(`${dir}/.git/HEAD`, { encoding: 'utf8' })).trim()).toBe(
      'ref: refs/heads/main'
    )
    expect(await fs.exists(`${dir}/.git/refs/heads/main`)).toBe(false)
  })

  it('fetch --prune', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/test-prune`)).toBe(true)

    // act
    const { pruned } = await fetch({
      fs,
      http,
      dir,
      depth: 1,
      prune: true
    })

    // assert
    expect(pruned).toEqual(['refs/remotes/origin/test-prune'])
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/test-prune`)).toBe(false)
  })

  it('fetch --prune-tags', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)
    expect(await fs.exists(`${dir}/.git/refs/tags/v1.0.0-beta1`)).toBe(true)
    const oldValue = await fs.readFile(`${dir}/.git/refs/tags/v1.0.0`, { encoding: 'utf8' })

    // act
    await fetch({
      fs,
      http,
      dir,
      depth: 1,
      tags: true,
      pruneTags: true
    })

    // assert that tag was deleted
    expect(await fs.exists(`${dir}/.git/refs/tags/v1.0.0-beta1`)).toBe(false)
    // assert that tags was force-updated
    const newValue = await fs.readFile(`${dir}/.git/refs/tags/v1.0.0`, { encoding: 'utf8' })
    expect(oldValue).not.toBe(newValue)
  })
})
