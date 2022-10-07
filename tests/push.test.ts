import { setConfig, push, listBranches, Auth, setGitClientAgent } from 'git-essentials'
import { UnknownTransportError, HttpError, UserCanceledError } from 'git-essentials/errors'

import { FsFixtureData, makeFsFixture } from './helpers/makeFsFixture'
import { makeHttpFixture, HttpFixtureData } from './helpers/makeHttpFixture'
import { expectToFailAsync, expectToFailWithTypeAsync } from './helpers/assertionHelper'

import pushFsFixtureData from './fixtures/fs/push.json'
import pushHttpFixtureData from './fixtures/http/push.json'

type AuthCallbackParams = [url: string, auth: Auth]


describe('push', () => {
  beforeEach(() => {
    // The default agent string is version depended.
    // We need to set version independent variant to make sure HttpFixtures will work.
    setGitClientAgent('git/git-essentials')

    // Newest Safari uses a different native implementation of CompressionStream.
    // We need this to make sure that tests will not fail and will resolve correct HttpFixture.
    ;(globalThis as any).__USE_PAKO_DEFLATE__ = true
  })

  afterEach(() => {
    delete (globalThis as any).__USE_PAKO_DEFLATE__
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
    expect(res).toBeDefined()
    expect(res.ok).toBe(true)
    expect(res.refs['refs/heads/main'].ok).toBe(true)
    expect(output).toEqual([
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
    expect(res).toBeDefined()
    expect(res.ok).toBe(true)
    expect(res.refs['refs/heads/main'].ok).toBe(true)
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
    expect(res).toBeDefined()
    expect(res.ok).toBe(true)
    expect(res.refs['refs/heads/foobar'].ok).toBe(true)
    expect(await listBranches({ fs, dir, remote: 'local' })).toContain(
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
    expect(res).toBeDefined()
    expect(res.ok).toBe(true)
    expect(res.refs['refs/tags/lightweight-tag'].ok).toBe(true)
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
    expect(res).toBeDefined()
    expect(res.ok).toBe(true)
    expect(res.refs['refs/tags/annotated-tag'].ok).toBe(true)
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
    expect(await listBranches({ fs, dir, remote: 'local' })).toContain(
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
    expect(res).toBeDefined()
    expect(res.ok).toBe(true)
    expect(res.refs['refs/heads/foobar'].ok).toBe(true)
    expect(await listBranches({ fs, dir, remote: 'local' })).not.toContain(
      'foobar'
    )
  })

  it('throws UnknownTransportError if using shorter scp-like syntax', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)
    await setConfig({ fs, dir, path: 'remote.ssh.url', value: `git@localhost/push-server.git` })

    // act
    const action = async () => {
      await push({
        fs,
        http,
        dir,
        remote: 'ssh',
        ref: 'main',
      })
    }

    // assert
    await expectToFailWithTypeAsync(action, UnknownTransportError)
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
    expect(res).toBeDefined()
    expect(res.ok).toBe(true)
    expect(res.refs['refs/heads/main'].ok).toBe(true)
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
    expect(res).toBeDefined()
    expect(res.ok).toBe(true)
    expect(res.refs['refs/heads/main'].ok).toBe(true)
  })

  it('throws an Error if no credentials supplied', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    const action = async () => {
      await push({
        fs,
        http,
        dir,
        remote: 'auth',
        ref: 'main',
      })
    }

    // assert
    await expectToFailAsync(action, (err) => (<string>err.message).includes('401'))
  })

  it('throws an Error if invalid credentials supplied', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    const action = async () => {
      await push({
        fs,
        http,
        dir,
        remote: 'auth',
        ref: 'main',
        onAuth: () => ({ username: 'test', password: 'test' }),
      })
    }

    // assert
    await expectToFailAsync(action, (err) => (<string>err.message).includes('401'))
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
    expect(onAuthArgs).toEqual([
      [
        `http://localhost/push-server-auth.git`,
        {
          headers: {},
        },
      ],
    ])
    expect(onAuthSuccessArgs).toEqual([
      [
        `http://localhost/push-server-auth.git`,
        {
          username: 'testuser',
          password: 'testpassword',
        },
      ],
    ])
    expect(onAuthFailureArgs).toEqual([])
  })

  it('onAuthFailure', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(pushFsFixtureData as FsFixtureData)
    const http = makeHttpFixture(pushHttpFixtureData as HttpFixtureData)

    // act
    const onAuthArgs: AuthCallbackParams[] = []
    const onAuthSuccessArgs: AuthCallbackParams[] = []
    const onAuthFailureArgs: AuthCallbackParams[] = []
    const action = async () => {
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
    }

    // assert
    await expectToFailAsync(action, (err) =>
      err instanceof HttpError && Boolean(err.data.response)
    )

    expect(onAuthArgs).toEqual([
      [
        `http://localhost/push-server-auth.git`,
        {
          headers: {},
        },
      ],
    ])
    expect(onAuthSuccessArgs).toEqual([])
    expect(onAuthFailureArgs).toEqual([
      [
        `http://localhost/push-server-auth.git`,
        {
          headers: {
            Authorization: 'Basic dGVzdHVzZXI6Tm9UX3JJZ0h0',
          },
          username: 'testuser',
          password: 'NoT_rIgHt',
        },
      ],
      [
        `http://localhost/push-server-auth.git`,
        {
          headers: {
            Authorization: 'Basic dGVzdHVzZXI6U3QxbGxfTm9UX3JJZ0h0',
          },
          username: 'testuser',
          password: 'St1ll_NoT_rIgHt',
        },
      ],
      [
        `http://localhost/push-server-auth.git`,
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
    expect(onAuthArgs).toEqual([
      [
        `http://localhost/push-server-auth.git`,
        {
          headers: {},
        },
      ],
    ])
    expect(onAuthSuccessArgs).toEqual([
      [
        `http://localhost/push-server-auth.git`,
        {
          username: 'testuser',
          password: 'testpassword',
        },
      ],
    ])
    expect(onAuthFailureArgs).toEqual([
      [
        `http://localhost/push-server-auth.git`,
        {
          headers: {
            Authorization: 'Basic dGVzdHVzZXI6Tm9UX3JJZ0h0',
          },
          username: 'testuser',
          password: 'NoT_rIgHt',
        },
      ],
      [
        `http://localhost/push-server-auth.git`,
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
    const onAuthArgs: AuthCallbackParams[] = []
    const onAuthSuccessArgs: AuthCallbackParams[] = []
    const onAuthFailureArgs: AuthCallbackParams[] = []
    const action = async () => {
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
    }

    // assert
    await expectToFailWithTypeAsync(action, UserCanceledError)

    expect(onAuthArgs).toEqual([
      [
        `http://localhost/push-server-auth.git`,
        {
          headers: {},
        },
      ],
    ])
    expect(onAuthSuccessArgs).toEqual([])
    expect(onAuthFailureArgs).toEqual([])
  })
})
