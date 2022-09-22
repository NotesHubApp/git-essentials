import { expect } from 'chai'

import { Errors, setConfig, push, listBranches } from '../src'
import { setGitClientAgent } from '../src/utils/pkg'
import { FsFixtureData, makeFsFixture } from './helpers/makeFsFixture'
import { makeHttpFixture, HttpFixtureData } from './helpers/makeHttpFixture'

import pushFsFixtureData from './fixtures/fs/push.json'
import pushHttpFixtureData from './fixtures/http/push.json'


describe('push', () => {
  beforeEach(() => {
    setGitClientAgent('git/git-essentials')
  })

  it('push', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)
    await setConfig({ fs, dir, path: 'remote.karma.url', value: `http://localhost/test-push-server.git` })
    const output: string[] = []

    // act
    const res = await push({
      fs,
      http,
      dir,
      onMessage: async m => {
        output.push(m)
      },
      remote: 'karma',
      ref: 'refs/heads/main',
    })

    // assert
    expect(res).to.be.not.undefined
    expect(res.ok).to.be.true
    expect(res.refs['refs/heads/main'].ok).to.be.true
    expect(output).to.eql([
        "build started...\n",
        "build completed...\n",
        "tests started...\n",
        "tests completed...\n",
        "starting server...\n",
        "server running\n",
        "Here is a message from 'post-receive' hook.\n",
      ])
  })

  it('push without ref', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)
    await setConfig({ fs, dir, path: 'remote.karma.url', value: `http://localhost/test-push-server.git` })

    // act
    const res = await push({
      fs,
      http,
      dir,
      remote: 'karma'
    })

    // assert
    expect(res).to.be.not.undefined
    expect(res.ok).to.be.true
    expect(res.refs['refs/heads/main'].ok).to.be.true
  })

  it('push with ref !== remoteRef', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)
    await setConfig({ fs, dir, path: 'remote.karma.url', value: `http://localhost/test-push-server.git` })

    // act
    const res = await push({
      fs,
      http,
      dir,
      remote: 'karma',
      ref: 'main',
      remoteRef: 'foobar'
    })

    // assert
    expect(res).to.be.not.undefined
    expect(res.ok).to.be.true
    expect(res.refs['refs/heads/foobar'].ok).to.be.true
    expect(await listBranches({ fs, dir, remote: 'karma' })).to.contain(
      'foobar'
    )
  })
})
