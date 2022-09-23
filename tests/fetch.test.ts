import { expect } from 'chai'

import { Errors, setConfig, fetch } from '../src'
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

  // it('fetch (from Github)', async () => {
  //   const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
  //   const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

  //   // Smoke Test
  //   await fetch({
  //     fs,
  //     http,
  //     dir,
  //     singleBranch: true,
  //     remote: 'origin',
  //     ref: 'test-branch-shallow-clone',
  //   })
  //   expect(
  //     await fs.exists(`${dir}/.git/refs/remotes/origin/test-branch-shallow-clone`)
  //   ).to.be.true
  //   expect(await fs.exists(`${dir}/.git/refs/remotes/origin/main`)).to.be.false
  // })

  // it('shallow fetch (from Github)', async () => {
  //   const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
  //   const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

  //   const output: string[] = []
  //   const progress = []
  //   // Test
  //   await fetch({
  //     fs,
  //     http,
  //     dir,
  //     onMessage: async x => {
  //       output.push(x)
  //     },
  //     onProgress: async y => {
  //       progress.push(y)
  //     },
  //     depth: 1,
  //     singleBranch: true,
  //     remote: 'origin',
  //     ref: 'test-branch-shallow-clone',
  //   })

  //   expect(await fs.exists(`${dir}/.git/shallow`)).to.be.true
  //   expect(output[output.length - 1].split(' ')[1]).to.eq('551')
  //   let shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
  //   expect(shallow === '92e7b4123fbf135f5ffa9b6fe2ec78d07bbc353e\n').to.be.true
  //   // Now test deepen
  //   await fetch({
  //     fs,
  //     http,
  //     dir,
  //     depth: 2,
  //     singleBranch: true,
  //     remote: 'origin',
  //     ref: 'test-branch-shallow-clone',
  //   })

  //   shallow = (await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' }))
  //   expect(shallow === '86ec153c7b48e02f92930d07542680f60d104d31\n').to.be.true
  // })

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
        ref: 'test-branch-shallow-clone',
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
        ref: 'test-branch-shallow-clone',
      })
    } catch (e: any) {
      err = e
    }

    // assert
    expect(err).to.be.not.undefined
    expect(err.code).to.eq(Errors.UnknownTransportError.code)
    expect(err.data.suggestion).to.eq(
      'https://github.com/isomorphic-git/isomorphic-git.git'
    )
  })

  // it('shallow fetch single commit by hash (from Github)', async () => {
  //   const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
  //   const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

  //   // Test
  //   await fetch({
  //     fs,
  //     http,
  //     dir,
  //     singleBranch: true,
  //     remote: 'origin',
  //     depth: 1,
  //     ref: '36d201c8fea9d87128e7fccd32c21643f355540d',
  //   })
  //   expect(await fs.exists(`${dir}/.git/shallow`)).to.be.true
  //   const shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
  //   expect(shallow).to.eq('36d201c8fea9d87128e7fccd32c21643f355540d\n')
  // })

  // it('shallow fetch since (from Github)', async () => {
  //   const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
  //   const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

  //   // Test
  //   await fetch({
  //     fs,
  //     http,
  //     dir,
  //     since: new Date(1506571200000),
  //     singleBranch: true,
  //     remote: 'origin',
  //     ref: 'test-branch-shallow-clone',
  //   })
  //   expect(await fs.exists(`${dir}/.git/shallow`)).to.be.true
  //   const shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
  //   expect(shallow).to.eq('36d201c8fea9d87128e7fccd32c21643f355540d\n')
  // })

  // it('shallow fetch exclude (from Github)', async () => {
  //   // arrange
  //   const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
  //   const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

  //   // act
  //   await fetch({
  //     fs,
  //     http,
  //     dir,
  //     exclude: ['v0.0.5'],
  //     singleBranch: true,
  //     remote: 'origin',
  //     ref: 'test-branch-shallow-clone',
  //   })

  //   // assert
  //   expect(await fs.exists(`${dir}/.git/shallow`)).to.be.true
  //   const shallow = (await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' }))
  //   expect(shallow).to.eq('0094dadf9804971c851e99b13845d10c8849db12\n')
  // })

  // it('shallow fetch relative (from Github)', async () => {
  //   // arrange
  //   const { fs, dir } = await makeFsFixture(fetchCorsFsFixtureData as FsFixtureData)
  //   const http = makeHttpFixture(fetchHttpFixtureData as HttpFixtureData)

  //   // act
  //   await fetch({
  //     fs,
  //     http,
  //     dir,
  //     depth: 1,
  //     singleBranch: true,
  //     remote: 'origin',
  //     ref: 'test-branch-shallow-clone',
  //   })

  //   // assert
  //   expect(await fs.exists(`${dir}/.git/shallow`)).to.be.true
  //   let shallow = await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' })
  //   expect(shallow).to.eq('92e7b4123fbf135f5ffa9b6fe2ec78d07bbc353e\n')
  //   // Now test deepen
  //   await fetch({
  //     fs,
  //     http,
  //     dir,
  //     relative: true,
  //     depth: 1,
  //     singleBranch: true,
  //     remote: 'origin',
  //     ref: 'test-branch-shallow-clone',
  //   })

  //   shallow = (await fs.readFile(`${dir}/.git/shallow`, { encoding: 'utf8' }))
  //   expect(shallow).to.eq('86ec153c7b48e02f92930d07542680f60d104d31\n')
  // })

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
