import { expect } from 'chai'

import { clone, currentBranch } from '../src'
import { setGitClientAgent } from '../src/utils/pkg'
import { makeFsFixture } from './helpers/makeFsFixture'
import { makeHttpFixture, HttpFixtureData } from './helpers/makeHttpFixture'

import cloneHttpFixtureData from './fixtures/http/clone.json'


describe('clone', () => {
  beforeEach(() => {
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
    expect(await fs.exists(`${dir}/.git`)).to.be.true
    expect(await fs.exists(`${dir}/.git/objects`)).to.be.true
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/main`)).to.be.true
    expect(await fs.exists(`${dir}/.git/refs/heads/main`)).to.be.true
    expect(await fs.exists(`${dir}/Welcome note.md`)).to.be.true
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
    expect(await fs.exists(`${dir}`)).to.be.true
    expect(await fs.exists(`${dir}/.git/objects`)).to.be.true
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/main`)).to.be.true
    expect(await fs.exists(`${dir}/.git/refs/heads/main`)).to.be.true
    expect(await fs.exists(`${dir}/Welcome note.md`)).to.be.false
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
    expect(await fs.exists(`${dir}`)).to.be.true
    expect(await fs.exists(`${dir}/.git/objects`)).to.be.true
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/v2.0`)).to.be.false
    expect(await fs.exists(`${dir}/.git/refs/heads/v2.0`)).to.be.false
    expect(await fs.exists(`${dir}/.git/refs/tags/v2.0`)).to.be.true
    expect(await fs.exists(`${dir}/Welcome note.md`)).to.be.true
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
    expect(await currentBranch({ fs, dir })).to.eq('i-am-not-main')
  })

  it('clone with an unregistered protocol', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)
    const url = `foobar://github.com/NotesHubApp/Welcome`
    let error = null

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
    expect(error.message).to.eq(`Git remote "${url}" uses an unrecognized transport protocol: "foobar"`)
    expect(error.caller).to.eq('git.clone')
  })

  it('clone empty repository', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture()
    const http = makeHttpFixture(cloneHttpFixtureData as HttpFixtureData)

    // act
    await clone({ fs, http, dir, url: `http://localhost/empty.git` })

    // assert
    expect(await fs.exists(`${dir}`)).to.be.true
    expect(await fs.exists(`${dir}/.git/HEAD`)).to.be.true
    const headFile = <string>await fs.readFile(`${dir}/.git/HEAD`, { encoding: 'utf8' })
    expect(headFile.trim()).to.eq('ref: refs/heads/main')
    expect(await fs.exists(`${dir}/.git/refs/heads/main`)).to.be.false
  })
})
