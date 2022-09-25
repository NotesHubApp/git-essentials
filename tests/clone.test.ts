import { clone, currentBranch } from '../src'
import { setGitClientAgent } from '../src/utils/pkg'
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
    const url = 'https://github.com/NotesHubApp/Welcome.git'

    // act
    await clone({
      fs,
      http,
      dir,
      url,
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

  it('clone with an unregistered protocol', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)
    const url = `foobar://github.com/NotesHubApp/Welcome`
    let error

    // act
    try {
      await clone({
        fs,
        http,
        dir,
        depth: 1,
        singleBranch: true,
        ref: 'test-tag',
        url,
      })
    } catch (err: any) {
      error = err
    }

    // assert
    expect(error.message).toBe(`Git remote "${url}" uses an unrecognized transport protocol: "foobar"`)
    expect(error.caller).toBe('git.clone')
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
})
