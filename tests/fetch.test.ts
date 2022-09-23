import { expect } from 'chai'

import { Errors, fetch } from '../src'
import { setGitClientAgent } from '../src/utils/pkg'
import { FsFixtureData, makeFsFixture } from './helpers/makeFsFixture'
import { makeHttpFixture, HttpFixtureData } from './helpers/makeHttpFixture'

import emptyFsFixtureData from './fixtures/fs/empty.json'
import fetchFsFixtureData from './fixtures/fs/fetch.json'
import fetchCorsFsFixtureData from './fixtures/fs/fetch-cors.json'
import fetchMissingRefspecFsFixtureData from './fixtures/fs/fetch-missing-refspec.json'
import fetchHttpFixtureData from './fixtures/http/fetch.json'


describe('fetch', () => {
  beforeEach(() => {
    setGitClientAgent('git/git-essentials')
  })

  it('fetch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
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
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/test`)).to.be.true
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/main`)).to.be.false
  })

  it('shallow fetch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)
    const output: string[] = []
    const progress = []

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
    expect(await fs.exists(`${dir}/.git/shallow`)).to.be.true
    expect(output[output.length - 1].split(' ')[1]).to.eq('5')
    let shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
    expect(shallow).to.eq('97c024f73eaab2781bf3691597bc7c833cb0e22f\n')

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
    expect(shallow).to.eq('c82587c97be8f9a10088590e06c9d0f767ed5c4a\n')
  })

  it('throws UnknownTransportError if using shorter scp-like syntax', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    let err
    try {
      await fetch({
        fs,
        http,
        dir,
        depth: 1,
        singleBranch: true,
        remote: 'ssh',
        ref: 'main',
      })
    } catch (e: any) {
      err = e
    }

    // assert
    expect(err).to.be.not.undefined
    expect(err.code).to.eq(Errors.UnknownTransportError.code)
  })

  it('the SSH -> HTTPS UnknownTransportError suggestion feature', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    let err
    try {
      await fetch({
        fs,
        http,
        dir,
        depth: 1,
        singleBranch: true,
        remote: 'ssh',
        ref: 'main',
      })
    } catch (e: any) {
      err = e
    }

    // assert
    expect(err).to.be.not.undefined
    expect(err.code).to.eq(Errors.UnknownTransportError.code)
    expect(err.data.suggestion).to.eq(
      'https://localhost/fetch-server.git'
    )
  })

  it('shallow fetch single commit by hash', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
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
    expect(await fs.exists(`${dir}/.git/shallow`)).to.be.true
    const shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
    expect(shallow).to.eq('5a8905a02e181fe1821068b8c0f48cb6633d5b81\n')
  })

  // it('shallow fetch since', async () => {
  //   // arrange
  //   const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
  //   const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

  //   // act
  //   await fetch({
  //     fs,
  //     http,
  //     dir,
  //     since: new Date(2017, 8, 20, 18, 52, 7),
  //     singleBranch: true,
  //     remote: 'origin',
  //     ref: 'test'
  //   })

  //   // assert
  //   expect(await fs.exists(`${dir}/.git/shallow`)).to.be.true
  //   const shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
  //   expect(shallow).to.eq('36d201c8fea9d87128e7fccd32c21643f355540d\n')
  // })

  it('shallow fetch exclude', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
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
    expect(await fs.exists(`${dir}/.git/shallow`)).to.be.true
    const shallow = (await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' }))
    expect(shallow).to.eq('c82587c97be8f9a10088590e06c9d0f767ed5c4a\n')
  })

  it('shallow fetch relative', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
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
    expect(await fs.exists(`${dir}/.git/shallow`)).to.be.true
    let shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
    expect(shallow).to.eq('97c024f73eaab2781bf3691597bc7c833cb0e22f\n')

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
    expect(shallow).to.eq('c82587c97be8f9a10088590e06c9d0f767ed5c4a\n')
  })

  it('errors if missing refspec', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchMissingRefspecFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

    // act
    let err
    try {
      await fetch({
        fs,
        http,
        dir,
        singleBranch: true,
        depth: 1,
        remote: 'origin',
        ref: 'main',
      })
    } catch (e: any) {
      err = e
    }

    // assert
    expect(err).not.to.be.undefined
    expect(err.code).to.eq(Errors.NoRefspecError.code)
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
    expect(await fs.exists(`${dir}`)).to.be.true
    expect(await fs.exists(`${dir}/.git/HEAD`)).to.be.true
    expect((<string>await fs.readFile(`${dir}/.git/HEAD`, { encoding: 'utf8' })).trim()).to.eq(
      'ref: refs/heads/main'
    )
    expect(await fs.exists(`${dir}/.git/refs/heads/main`)).to.be.false
  })

  it('fetch --prune', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/test-prune`)).to.be.true

    // act
    const { pruned } = await fetch({
      fs,
      http,
      dir,
      depth: 1,
      prune: true
    })

    // assert
    expect(pruned).to.eql(['refs/remotes/origin/test-prune'])
    expect(await fs.exists(`${dir}/.git/refs/remotes/origin/test-prune`)).to.be.false
  })

  it('fetch --prune-tags', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(fetchFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)
    expect(await fs.exists(`${dir}/.git/refs/tags/v1.0.0-beta1`)).to.be.true
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
    expect(await fs.exists(`${dir}/.git/refs/tags/v1.0.0-beta1`)).to.be.false
    // assert that tags was force-updated
    const newValue = await fs.readFile(`${dir}/.git/refs/tags/v1.0.0`, { encoding: 'utf8' })
    expect(oldValue).not.to.eq(newValue)
  })
})
