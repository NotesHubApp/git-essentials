import { trimEndChar } from '../src/utils/trimEndChar'

describe('utils', () => {
  describe('trimEndChar', () => {
    it('trim NULL', () => {
      // arrange
      const target = `6750510df071894ab9518f2fb274fa5341b619f2 refs/heads/main report-status report-status-v2 delete-refs side-band-64k ofs-delta atomic object-format=sha1 quiet agent=github/spokes-receive-pack-acac8763c60f636c44baaf5c3887895cf5f55c30 session-id=FEBF:FFB9E:5693ABD:5A9F02A:6835ECDB push-optio 
`
      const expected = `6750510df071894ab9518f2fb274fa5341b619f2 refs/heads/main report-status report-status-v2 delete-refs side-band-64k ofs-delta atomic object-format=sha1 quiet agent=github/spokes-receive-pack-acac8763c60f636c44baaf5c3887895cf5f55c30 session-id=FEBF:FFB9E:5693ABD:5A9F02A:6835ECDB push-optio`

      // act
      const actual = trimEndChar(target.trim(), '\x00')

      // assert
      expect(actual).toEqual(expected)
    })
  })

  it('no trim needed', () => {
    // arrange
    const target = `6750510df071894ab9518f2fb274fa5341b619f2 HEAD multi_ack thin-pack side-band side-band-64k ofs-delta shallow deepen-since deepen-not deepen-relative no-progress include-tag multi_ack_detailed allow-tip-sha1-in-want allow-reachable-sha1-in-want no-done symref=HEAD:refs/heads/main filter object-format=sha1 agent=git/github-203a3d8c358f
`

    // act
    const actual = trimEndChar(target.trim(), '\x00')

    // assert
    expect(actual).toEqual(target.trim())
  })
})
