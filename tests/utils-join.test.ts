import { join } from '../src/utils/join'

const path = require('path').posix || require('path')

describe('utils', () => {
  describe('join', () => {
    it('should join "good" paths the same as path.join', () => {
      const fixtures = [
        ['/foo/bar', 'baz'],
        ['foo/bar', 'baz'],
        ['foo', 'bar', 'baz'],
        ['/', 'foo', 'bar', 'baz'],
        ['.', 'foo'],
        ['foo', '.'],
        ['.', '.'],
        ['.', 'foo', '.'],
        ['.', '.', '.'],
        ['/', '.'],
        ['/', '.git'],
        ['.', '.git'],
      ]

      for (const fixture of fixtures) {
        expect(join(...fixture)).toEqual(path.join(...fixture))
      }
    })

    it('should join degenerate paths the same as path.join in these cases', () => {
      // Tests adapted from path-browserify
      const fixtures = [
        [[], '.'],
        [['foo/x', './bar'], 'foo/x/bar'],
        [['foo/x/', './bar'], 'foo/x/bar'],
        [['foo/x/', '.', 'bar'], 'foo/x/bar'],
        [['.', '.', '.'], '.'],
        [['.', './', '.'], '.'],
        [['.', '/./', '.'], '.'],
        [['.', '/////./', '.'], '.'],
        [['.'], '.'],
        [['', '.'], '.'],
        [['foo', '/bar'], 'foo/bar'],
        [['foo', ''], 'foo'],
        [['foo', '', '/bar'], 'foo/bar'],
        [['/'], '/'],
        [['/', '.'], '/'],
        [[''], '.'],
        [['', ''], '.'],
        [['', 'foo'], 'foo'],
        [['', '', 'foo'], 'foo'],
        [[' /foo'], ' /foo'],
        [[' ', 'foo'], ' /foo'],
        [[' ', '.'], ' '],
        [[' ', ''], ' '],
        [['/', '/foo'], '/foo'],
        [['/', '//foo'], '/foo'],
        [['/', '', '/foo'], '/foo'],
        [['/', '.git'], '/.git']
      ]
      for (const [args, result] of fixtures) {
        expect(join(...args)).toEqual(result)
        expect(join(...args)).toEqual(path.join(...args))
      }
    })

    // TODO: After replacing join with Node.JS path.posix.join this will not work
    // it('should join degenerate paths differently from path.join in these cases', () => {
    //   // Tests adapted from path-browserify
    //   const disagreeFixtures = [
    //     [['./'], '.'],
    //     [['.', './'], '.'],
    //     [['', '/foo'], 'foo'],
    //     [['', '', '/foo'], 'foo'],
    //     [['foo/', ''], 'foo'],
    //     [['', '/', 'foo'], 'foo'],
    //     [['', '/', '/foo'], 'foo'],
    //   ]
    //   for (const [args, expected] of disagreeFixtures) {
    //     const actual = join(...args)

    //     expect(actual).toEqual(expected)
    //     expect(actual).not.toEqual(path.join(...args))
    //   }
    // })
  })
})
