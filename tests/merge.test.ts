import { expect } from 'chai'

import { Errors, merge, resolveRef, log } from '../src'
import { makeFsFixture, DataFixture } from './helpers/makeFsFixture'

import mergeDataFixture from './fixtures/data/merge.json'

describe('merge', () => {
  it('merge main into main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)

    // act
    const desiredOid = await resolveRef({
      fs,
      dir,
      ref: 'main',
    })
    const m = await merge({
      fs,
      dir,
      ours: 'main',
      theirs: 'main',
      fastForwardOnly: true
    })
    expect(m.oid).to.eq(desiredOid)
    expect(m.alreadyMerged).to.be.true
    expect(m.fastForward).to.be.oneOf([false, undefined])
    const oid = await resolveRef({
      fs,
      dir,
      ref: 'main',
    })
    expect(oid).to.eq(desiredOid)
  })

  it('merge medium into main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)

    // act
    const desiredOid = await resolveRef({
      fs,
      dir,
      ref: 'medium',
    })
    const m = await merge({
      fs,
      dir,
      ours: 'main',
      theirs: 'medium',
      fastForwardOnly: true,
    })
    expect(m.oid).to.eq(desiredOid)
    expect(m.alreadyMerged).to.be.true
    expect(m.fastForward).to.be.oneOf([false, undefined])
    const oid = await resolveRef({
      fs,
      dir,
      ref: 'main',
    })
    expect(oid).to.eq(desiredOid)
  })

  it('merge oldest into main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)

    // act
    const desiredOid = await resolveRef({
      fs,
      dir,
      ref: 'main',
    })
    const m = await merge({
      fs,
      dir,
      ours: 'main',
      theirs: 'oldest',
      fastForwardOnly: true,
    })
    expect(m.oid).to.eq(desiredOid)
    expect(m.alreadyMerged).to.be.true
    expect(m.fastForward).to.be.oneOf([false, undefined])
    const oid = await resolveRef({
      fs,
      dir,
      ref: 'main',
    })
    expect(oid).to.eq(desiredOid)
  })

  it('merge newest into main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)

    // act
    const desiredOid = await resolveRef({
      fs,
      dir,
      ref: 'newest',
    })
    const m = await merge({
      fs,
      dir,
      ours: 'main',
      theirs: 'newest',
      fastForwardOnly: true,
    })
    expect(m.oid).to.eq(desiredOid)
    expect(m.alreadyMerged).to.be.oneOf([false, undefined])
    expect(m.fastForward).to.be.true
    const oid = await resolveRef({
      fs,
      dir,
      ref: 'main',
    })
    expect(oid).to.eq(desiredOid)
  })

  it('merge newest into main --dryRun (no author needed since fastForward)', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)

    // act
    const originalOid = await resolveRef({
      fs,
      dir,
      ref: 'main',
    })
    const desiredOid = await resolveRef({
      fs,
      dir,
      ref: 'newest',
    })
    const m = await merge({
      fs,
      dir,
      ours: 'main',
      theirs: 'newest',
      fastForwardOnly: true,
      dryRun: true,
    })
    expect(m.oid).to.eq(desiredOid)
    expect(m.alreadyMerged).to.be.oneOf([false, undefined])
    expect(m.fastForward).to.be.true
    const oid = await resolveRef({
      fs,
      dir,
      ref: 'main',
    })
    expect(oid).to.eq(originalOid)
  })

  it('merge newest into main --noUpdateBranch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)

    // act
    const originalOid = await resolveRef({
      fs,
      dir,
      ref: 'main',
    })
    const desiredOid = await resolveRef({
      fs,
      dir,
      ref: 'newest',
    })
    const m = await merge({
      fs,
      dir,
      ours: 'main',
      theirs: 'newest',
      fastForwardOnly: true,
      dryRun: true,
    })
    expect(m.oid).to.eq(desiredOid)
    expect(m.alreadyMerged).to.be.oneOf([false, undefined])
    expect(m.fastForward).to.be.true
    const oid = await resolveRef({
      fs,
      dir,
      ref: 'main',
    })
    expect(oid).to.eq(originalOid)
  })

  it("merge 'add-files' and 'remove-files'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)
    const commit = (
      await log({
        fs,
        dir,
        depth: 1,
        ref: 'add-files-merge-remove-files',
      })
    )[0].commit

    // act
    const report = await merge({
      fs,
      dir,
      ours: 'add-files',
      theirs: 'remove-files',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
    })
    const mergeCommit = (
      await log({
        fs,
        dir,
        ref: 'add-files',
        depth: 1,
      })
    )[0].commit
    expect(report.tree).to.eq(commit.tree)
    expect(mergeCommit.tree).to.eq(commit.tree)
    expect(mergeCommit.message).to.eq(commit.message)
    expect(mergeCommit.parent).to.eql(commit.parent)
  })

  it("merge 'remove-files' and 'add-files'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)
    const commit = (
      await log({
        fs,
        dir,
        depth: 1,
        ref: 'remove-files-merge-add-files',
      })
    )[0].commit

    // actTest
    const report = await merge({
      fs,
      dir,
      ours: 'remove-files',
      theirs: 'add-files',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
    })
    const mergeCommit = (
      await log({
        fs,
        dir,
        ref: 'remove-files',
        depth: 1,
      })
    )[0].commit
    expect(report.tree).to.eq(commit.tree)
    expect(mergeCommit.tree).to.eq(commit.tree)
    expect(mergeCommit.message).to.eq(commit.message)
    expect(mergeCommit.parent).to.eql(commit.parent)
  })

  it("merge 'delete-first-half' and 'delete-second-half' (dryRun, missing author)", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)

    // act
    let error = null
    try {
      await merge({
        fs,
        dir,
        ours: 'delete-first-half',
        theirs: 'delete-second-half',
        dryRun: true,
      })
    } catch (e: any) {
      error = e
    }
    expect(error).not.to.be.null
    expect(error.code).to.eq(Errors.MissingNameError.code)
  })

  it("merge 'delete-first-half' and 'delete-second-half' (dryRun)", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)
    const commit = (
      await log({
        fs,
        dir,
        depth: 1,
        ref: 'delete-first-half-merge-delete-second-half',
      })
    )[0]
    const originalCommit = (
      await log({
        fs,
        dir,
        ref: 'delete-first-half',
        depth: 1,
      })
    )[0]

    // act
    const report = await merge({
      fs,
      dir,
      ours: 'delete-first-half',
      theirs: 'delete-second-half',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
      dryRun: true,
    })
    expect(report.tree).to.eq(commit.commit.tree)
    // make sure branch hasn't been moved
    const notMergeCommit = (
      await log({
        fs,
        dir,
        ref: 'delete-first-half',
        depth: 1,
      })
    )[0]
    expect(notMergeCommit.oid).to.eq(originalCommit.oid)
    if (!report.oid) throw new Error('type error')
    // make sure no commit object was created
    expect(
      await fs.exists(
        `${dir}/.git/objects/${report.oid.slice(0, 2)}/${report.oid.slice(2)}`
      )
    ).to.be.false
  })

  it("merge 'delete-first-half' and 'delete-second-half' (noUpdateBranch)", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)
    const commit = (
      await log({
        fs,
        dir,
        depth: 1,
        ref: 'delete-first-half-merge-delete-second-half',
      })
    )[0]
    const originalCommit = (
      await log({
        fs,
        dir,
        ref: 'delete-first-half',
        depth: 1,
      })
    )[0]

    // act
    const report = await merge({
      fs,
      dir,
      ours: 'delete-first-half',
      theirs: 'delete-second-half',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
      noUpdateBranch: true,
    })
    expect(report.tree).to.eq(commit.commit.tree)
    // make sure branch hasn't been moved
    const notMergeCommit = (
      await log({
        fs,
        dir,
        ref: 'delete-first-half',
        depth: 1,
      })
    )[0]
    expect(notMergeCommit.oid).to.eq(originalCommit.oid)
    if (!report.oid) throw new Error('type error')
    // but make sure the commit object exists
    expect(
      await fs.exists(
        `${dir}/.git/objects/${report.oid.slice(0, 2)}/${report.oid.slice(2)}`
      )
    ).to.eq(true)
  })

  it("merge 'delete-first-half' and 'delete-second-half'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)
    const commit = (
      await log({
        fs,
        dir,
        depth: 1,
        ref: 'delete-first-half-merge-delete-second-half',
      })
    )[0].commit

    // act
    const report = await merge({
      fs,
      dir,
      ours: 'delete-first-half',
      theirs: 'delete-second-half',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
    })
    const mergeCommit = (
      await log({
        fs,
        dir,
        ref: 'delete-first-half',
        depth: 1,
      })
    )[0].commit
    expect(report.tree).to.eq(commit.tree)
    expect(mergeCommit.tree).to.eq(commit.tree)
    expect(mergeCommit.message).to.eq(commit.message)
    expect(mergeCommit.parent).to.eql(commit.parent)
  })

  it("merge 'a-file' and 'a-folder'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)

    // act
    let error = null
    try {
      await merge({
        fs,
        dir,
        ours: 'a-file',
        theirs: 'a-folder',
        author: {
          name: 'Mr. Test',
          email: 'mrtest@example.com',
          timestamp: 1262356920,
          timezoneOffset: -0,
        },
      })
    } catch (e: any) {
      error = e
    }
    expect(error).not.to.be.null
    expect(error.code).to.eq(Errors.MergeNotSupportedError.code)
  })

  it("merge two branches that modified the same file (no conflict)'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)
    const commit = (
      await log({
        fs,
        dir,
        depth: 1,
        ref: 'a-merge-b',
      })
    )[0].commit

    // act
    const report = await merge({
      fs,
      dir,
      ours: 'a',
      theirs: 'b',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
    })
    const mergeCommit = (
      await log({
        fs,
        dir,
        ref: 'a',
        depth: 1,
      })
    )[0].commit
    expect(report.tree).to.eq(commit.tree)
    expect(mergeCommit.tree).to.eq(commit.tree)
    expect(mergeCommit.message).to.eq(commit.message)
    expect(mergeCommit.parent).to.eql(commit.parent)
  })

  it("merge two branches where one modified file and the other modified file mode'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)
    const commit = (
      await log({
        fs,
        dir,
        depth: 1,
        ref: 'a-merge-d',
      })
    )[0].commit

    // act
    const report = await merge({
      fs,
      dir,
      ours: 'a',
      theirs: 'd',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0,
      },
    })
    const mergeCommit = (
      await log({
        fs,
        dir,
        ref: 'a',
        depth: 1,
      })
    )[0].commit
    expect(report.tree).to.eq(commit.tree)
    expect(mergeCommit.tree).to.eq(commit.tree)
    expect(mergeCommit.message).to.eq(commit.message)
    expect(mergeCommit.parent).to.eql(commit.parent)
  })

  it("merge two branches that modified the same file (should conflict)'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeDataFixture as DataFixture)

    // act
    let error = null
    try {
      await merge({
        fs,
        dir,
        ours: 'a',
        theirs: 'c',
        author: {
          name: 'Mr. Test',
          email: 'mrtest@example.com',
          timestamp: 1262356920,
          timezoneOffset: -0,
        },
      })
    } catch (e: any) {
      error = e
    }
    expect(error).not.to.be.null
    expect(error.code).to.eq(Errors.MergeNotSupportedError.code)
  })
})
