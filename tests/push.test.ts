import { expect } from 'chai'

import { Errors, setConfig, push, listBranches, GitAuth } from '../src'
import { setGitClientAgent } from '../src/utils/pkg'
import { FsFixtureData, makeFsFixture } from './helpers/makeFsFixture'
import { makeHttpFixture, HttpFixtureData } from './helpers/makeHttpFixture'

import pushFsFixtureData from './fixtures/fs/push.json'
import pushHttpFixtureData from './fixtures/http/push.json'

type AuthCallbackParams = [url: string, auth: GitAuth]

describe('push', () => {
  beforeEach(() => {
    setGitClientAgent('git/git-essentials')
  })

  it('push', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)
    const output: string[] = []

    // act
    const res = await push({
      fs,
      http,
      dir,
      onMessage: async m => {
        output.push(m)
      },
      remote: 'local',
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

    // act
    const res = await push({
      fs,
      http,
      dir,
      remote: 'local'
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

    // act
    const res = await push({
      fs,
      http,
      dir,
      remote: 'local',
      ref: 'main',
      remoteRef: 'foobar'
    })

    // assert
    expect(res).to.be.not.undefined
    expect(res.ok).to.be.true
    expect(res.refs['refs/heads/foobar'].ok).to.be.true
    expect(await listBranches({ fs, dir, remote: 'local' })).to.contain(
      'foobar'
    )
  })

  it('push with lightweight tag', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    const res = await push({
      fs,
      http,
      dir,
      remote: 'local',
      ref: 'lightweight-tag',
    })

    // assert
    expect(res).to.be.not.undefined
    expect(res.ok).to.be.true
    expect(res.refs['refs/tags/lightweight-tag'].ok).to.be.true
  })

  it('push with annotated tag', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    const res = await push({
      fs,
      http,
      dir,
      remote: 'local',
      ref: 'annotated-tag',
    })

    // assert
    expect(res).to.be.not.undefined
    expect(res.ok).to.be.true
    expect(res.refs['refs/tags/annotated-tag'].ok).to.be.true
  })

  it('push delete', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    await push({
      fs,
      http,
      dir,
      remote: 'local',
      ref: 'main',
      remoteRef: 'foobar',
    })
    // assert
    expect(await listBranches({ fs, dir, remote: 'local' })).to.contain(
      'foobar'
    )

    // act
    const res = await push({
      fs,
      http,
      dir,
      remote: 'local',
      remoteRef: 'foobar',
      delete: true,
    })
    // assert
    expect(res).to.be.not.undefined
    expect(res.ok).to.be.true
    expect(res.refs['refs/heads/foobar'].ok).to.be.true
    expect(await listBranches({ fs, dir, remote: 'local' })).not.to.contain(
      'foobar'
    )
  })

  it('throws UnknownTransportError if using shorter scp-like syntax', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)
    await setConfig({ fs, dir, path: 'remote.ssh.url', value: `git@localhost/test-push-server.git` })

    // act
    let err
    try {
      await push({
        fs,
        http,
        dir,
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

  it('push with Basic Auth', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    const res = await push({
      fs,
      http,
      dir,
      remote: 'auth',
      ref: 'main',
      onAuth: () => ({ username: 'testuser', password: 'testpassword' }),
    })

    // assert
    expect(res).to.be.not.undefined
    expect(res.ok).to.be.true
    expect(res.refs['refs/heads/main'].ok).to.be.true
  })

  it('push with Basic Auth credentials in the URL', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    const res = await push({
      fs,
      http,
      dir,
      remote: 'url',
      ref: 'main',
    })

    // assert
    expect(res).to.be.not.undefined
    expect(res.ok).to.be.true
    expect(res.refs['refs/heads/main'].ok).to.be.true
  })

  it('throws an Error if no credentials supplied', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    let error = null
    try {
      await push({
        fs,
        http,
        dir,
        remote: 'auth',
        ref: 'main',
      })
    } catch (err: any) {
      error = err.message
    }

    // assert
    expect(error).to.contain('401')
  })

  it('throws an Error if invalid credentials supplied', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    let error = null
    try {
      await push({
        fs,
        http,
        dir,
        remote: 'auth',
        ref: 'main',
        onAuth: () => ({ username: 'test', password: 'test' }),
      })
    } catch (err: any) {
      error = err.message
    }

    // assert
    expect(error).to.contain('401')
  })

  it('onAuthSuccess', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    const onAuthArgs: AuthCallbackParams[] = []
    const onAuthSuccessArgs: AuthCallbackParams[] = []
    const onAuthFailureArgs: AuthCallbackParams[] = []
    await push({
      fs,
      http,
      dir,
      remote: 'auth',
      ref: 'main',
      async onAuth(...args) {
        onAuthArgs.push(args)
        return {
          username: 'testuser',
          password: 'testpassword',
        }
      },
      async onAuthSuccess(...args) {
        onAuthSuccessArgs.push(args)
      },
      async onAuthFailure(...args) {
        onAuthFailureArgs.push(args)
      },
    })

    // assert
    expect(onAuthArgs).to.eql([
      [
        `http://localhost/test-push-server-auth.git`,
        {
          headers: {},
        },
      ],
    ])
    expect(onAuthSuccessArgs).to.eql([
      [
        `http://localhost/test-push-server-auth.git`,
        {
          username: 'testuser',
          password: 'testpassword',
        },
      ],
    ])
    expect(onAuthFailureArgs).to.eql([])
  })

  it('onAuthFailure', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    let err
    const onAuthArgs: AuthCallbackParams[] = []
    const onAuthSuccessArgs: AuthCallbackParams[] = []
    const onAuthFailureArgs: AuthCallbackParams[] = []
    try {
      await push({
        fs,
        http,
        dir,
        remote: 'auth',
        ref: 'main',
        async onAuth(...args) {
          onAuthArgs.push(args)
          return {
            username: 'testuser',
            password: 'NoT_rIgHt',
          }
        },
        async onAuthSuccess(...args) {
          onAuthSuccessArgs.push(args)
        },
        async onAuthFailure(...args) {
          onAuthFailureArgs.push(args)
          switch (onAuthFailureArgs.length) {
            case 1:
              return {
                username: 'testuser',
                password: 'St1ll_NoT_rIgHt',
              }
            case 2:
              return {
                headers: {
                  Authorization: 'Bearer Big Bear',
                  'X-Authorization': 'supersecret',
                },
              }
          }
        },
      })
    } catch (e: any) {
      err = e
    }

    // assert
    expect(err).to.be.not.undefined
    expect(err.code).to.eq(Errors.HttpError.code)
    expect(err.data.response).to.be.not.undefined
    expect(onAuthArgs).to.eql([
      [
        `http://localhost/test-push-server-auth.git`,
        {
          headers: {},
        },
      ],
    ])
    expect(onAuthSuccessArgs).to.eql([])
    expect(onAuthFailureArgs).to.eql([
      [
        `http://localhost/test-push-server-auth.git`,
        {
          headers: {
            Authorization: 'Basic dGVzdHVzZXI6Tm9UX3JJZ0h0',
          },
          username: 'testuser',
          password: 'NoT_rIgHt',
        },
      ],
      [
        `http://localhost/test-push-server-auth.git`,
        {
          headers: {
            Authorization: 'Basic dGVzdHVzZXI6U3QxbGxfTm9UX3JJZ0h0',
          },
          username: 'testuser',
          password: 'St1ll_NoT_rIgHt',
        },
      ],
      [
        `http://localhost/test-push-server-auth.git`,
        {
          headers: {
            Authorization: 'Bearer Big Bear',
            'X-Authorization': 'supersecret',
          },
        },
      ],
    ])
  })

  it('onAuthFailure then onAuthSuccess', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    const onAuthArgs: AuthCallbackParams[] = []
    const onAuthSuccessArgs: AuthCallbackParams[] = []
    const onAuthFailureArgs: AuthCallbackParams[] = []
    await push({
      fs,
      http,
      dir,
      remote: 'auth',
      ref: 'main',
      async onAuth(...args) {
        onAuthArgs.push(args)
        return {
          username: 'testuser',
          password: 'NoT_rIgHt',
        }
      },
      async onAuthSuccess(...args) {
        onAuthSuccessArgs.push(args)
      },
      async onAuthFailure(...args) {
        onAuthFailureArgs.push(args)
        switch (onAuthFailureArgs.length) {
          case 1:
            return {
              username: 'testuser',
              password: 'St1ll_NoT_rIgHt',
            }
          case 2:
            return {
              username: 'testuser',
              password: 'testpassword',
            }
        }
      },
    })

    // assert
    expect(onAuthArgs).to.eql([
      [
        `http://localhost/test-push-server-auth.git`,
        {
          headers: {},
        },
      ],
    ])
    expect(onAuthSuccessArgs).to.eql([
      [
        `http://localhost/test-push-server-auth.git`,
        {
          username: 'testuser',
          password: 'testpassword',
        },
      ],
    ])
    expect(onAuthFailureArgs).to.eql([
      [
        `http://localhost/test-push-server-auth.git`,
        {
          headers: {
            Authorization: 'Basic dGVzdHVzZXI6Tm9UX3JJZ0h0',
          },
          username: 'testuser',
          password: 'NoT_rIgHt',
        },
      ],
      [
        `http://localhost/test-push-server-auth.git`,
        {
          headers: {
            Authorization: 'Basic dGVzdHVzZXI6U3QxbGxfTm9UX3JJZ0h0',
          },
          username: 'testuser',
          password: 'St1ll_NoT_rIgHt',
        },
      ],
    ])
  })

  it('onAuth + cancel', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    let err
    const onAuthArgs: AuthCallbackParams[] = []
    const onAuthSuccessArgs: AuthCallbackParams[] = []
    const onAuthFailureArgs: AuthCallbackParams[] = []
    try {
      await push({
        fs,
        http,
        dir,
        remote: 'auth',
        ref: 'main',
        async onAuth(...args) {
          onAuthArgs.push(args)
          return {
            cancel: true,
          }
        },
        async onAuthSuccess(...args) {
          onAuthSuccessArgs.push(args)
        },
        async onAuthFailure(...args) {
          onAuthFailureArgs.push(args)
        },
      })
    } catch (e: any) {
      err = e
    }

    // assert
    expect(err).to.be.not.undefined
    expect(err.code).to.eq('UserCanceledError')
    expect(onAuthArgs).to.eql([
      [
        `http://localhost/test-push-server-auth.git`,
        {
          headers: {},
        },
      ],
    ])
    expect(onAuthSuccessArgs).to.eql([])
    expect(onAuthFailureArgs).to.eql([])
  })
})
