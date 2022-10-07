import {
  checkout,
  clone,
  currentBranch,
  getConfig,
} from 'git-essentials'
import {
  UnknownTransportError,
  InternalError,
  NotFoundError,
  AlreadyExistsError
} from 'git-essentials/errors'
import { setGitClientAgent } from 'git-essentials/utils/pkg'

import { expectToFailAsync, expectToFailWithErrorAsync, expectToFailWithTypeAsync } from './helpers/assertionHelper'
import { makeFsFixture } from './helpers/makeFsFixture'
import { makeHttpFixture, HttpFixtureData } from './helpers/makeHttpFixture'

import cloneHttpFixtureData from './fixtures/http/clone.json'


describe('clone', () => {
  beforeEach(() => {
    // The default agent string is version depended.
    // We need to set version independent variant to make sure HttpFixtures will work.
    setGitClientAgent('git/git-essentials')
  })

  it('clone --no-tags --signle-branch --depth 1', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)

    // act
    await clone({
      fs,
      http,
      dir,
      url: 'https://github.com/NotesHubApp/Welcome.git',
      noTags: true,
      singleBranch: true,
      depth: 1
    })

    // assert
    expect(await fs.exists(`${dir}/.git`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/objects`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/main`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/refs/heads/main`)).toBe(true)
    expect(await fs.exists(`${dir}/Welcome note.md`)).toBe(true)
  })

  it('clone with noCheckout', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)
    const url = 'https://github.com/NotesHubApp/Welcome.git'

    // act
    await clone({
      fs,
      http,
      dir,
      depth: 1,
      noTags: true,
      singleBranch: true,
      noCheckout: true,
      url
    })

    // assert
    expect(await fs.exists(`${dir}`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/objects`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/main`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/refs/heads/main`)).toBe(true)
    expect(await fs.exists(`${dir}/Welcome note.md`)).toBe(false)
  })

  it('clone a tag', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)

    // act
    await clone({
      fs,
      http,
      dir,
      depth: 1,
      singleBranch: true,
      ref: 'v2.0',
      url: 'https://github.com/NotesHubApp/Welcome.git'
    })

    // assert
    expect(await fs.exists(`${dir}`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/objects`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/v2.0`)).toBe(false)
    expect(await fs.exists(`${dir}/.git/refs/heads/v2.0`)).toBe(false)
    expect(await fs.exists(`${dir}/.git/refs/tags/v2.0`)).toBe(true)
    expect(await fs.exists(`${dir}/Welcome note.md`)).toBe(true)
  })

  it('clone default branch with --singleBranch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)

    // act
    await clone({
      fs,
      http,
      dir,
      depth: 1,
      singleBranch: true,
      url: `http://localhost/clone-no-main.git`,
    })

    // assert
    expect(await currentBranch({ fs, dir })).toBe('i-am-not-main')
  })

  it('checkout of branch name that contains a dot', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)

    // act
    await clone({
      fs,
      http,
      dir,
      url: `http://localhost/clone-branch-with-dot.git`,
    })

    await checkout({ fs, dir, ref: 'v1.0.x' })
    const config = await fs.readFile(`${dir}/.git/config`, { encoding: 'utf8' })

    // assert
    expect(config).toContain(
      '\n[branch "v1.0.x"]\n\tmerge = refs/heads/v1.0.x\n\tremote = origin'
    )
  })

  it('clone with an unregistered protocol', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)
    const url = `foobar://github.com/NotesHubApp/Welcome`

    // act
    const action = async () => {
      await clone({
        fs,
        http,
        dir,
        depth: 1,
        singleBranch: true,
        ref: 'test-tag',
        url,
      })
    }

    // assert
    await expectToFailWithErrorAsync(action, new UnknownTransportError(url, 'foobar'))
  })

  it('clone empty repository', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)

    // act
    await clone({ fs, http, dir, url: `http://localhost/empty.git` })

    // assert
    expect(await fs.exists(`${dir}`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/HEAD`)).toBe(true)
    const headFile = <string>await fs.readFile(`${dir}/.git/HEAD`, { encoding: 'utf8' })
    expect(headFile.trim()).toBe('ref: refs/heads/main')
    expect(await fs.exists(`${dir}/.git/refs/heads/main`)).toBe(false)
  })

  it('clone with incomplete response may hang the request', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)

    // act
    const action = async () => {
      await clone({
        fs,
        http,
        dir,
        noTags: true,
        singleBranch: true,
        depth: 1,
        url: 'http://localhost/clone-with-incomplete-response' })
    }

    // assert
    await expectToFailAsync(action, (err) =>
      err instanceof InternalError && err.data.message.includes('Pako error'))
  })

  it('removes the .git directory when clone fails', async () => {
    // assert
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)

    // act
    const action = async () => {
      await clone({
        fs,
        http,
        dir,
        depth: 1,
        singleBranch: true,
        ref: 'test-tag',
        url: 'https://github.com/NotesHubApp/Welcome.git'
      })
    }

    // assert
    await expectToFailWithTypeAsync(action, NotFoundError)
    expect(await fs.exists(`${dir}/.git`)).toBe(false)
  })

  it('should not remove .git directory on failure when previously cloned another repo to the same directory', async () => {
    // assert
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)

    // act
    await clone({
      fs,
      http,
      dir,
      depth: 1,
      singleBranch: true,
      url: `http://localhost/clone-no-main.git`,
    })

    const action = async () => {
      await clone({
        fs,
        http,
        dir,
        depth: 1,
        noTags: true,
        singleBranch: true,
        url: 'https://github.com/NotesHubApp/Welcome.git'
      })
    }

    // assert
    await expectToFailWithTypeAsync(action, AlreadyExistsError)
    expect(await fs.exists(`${dir}/.git`)).toBe(true)
    expect(await currentBranch({ fs, dir })).toBe('i-am-not-main')
  }),

  it('should set up the remote tracking branch by default', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)

    // act
    await clone({
      fs,
      http,
      dir,
      url: 'https://github.com/NotesHubApp/Welcome.git',
      noTags: true,
      singleBranch: true,
      depth: 1
    })

    const [merge, remote] = await Promise.all([
      await getConfig({ fs, dir, path: 'branch.main.merge' }),
      await getConfig({ fs, dir, path: 'branch.main.remote' })
    ])

    // assert
    expect(merge).toBe('refs/heads/main')
    expect(remote).toBe('origin')
  })
})
