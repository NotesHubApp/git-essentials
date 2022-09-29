import { GitConfig } from '../src/models/GitConfig'


describe('GitConfig', () => {
  describe('get value', () => {
    it('simple (foo)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valfoo
      [bar]
      keyaaa = valbar`)

      // act
      const a = config.get('foo.keyaaa')

      // assert
      expect(a).toEqual('valfoo')
    })

    it('simple (bar)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valfoo
      [bar]
      keyaaa = valbar`)

      // act
      const a = config.get('bar.keyaaa')

      // assert
      expect(a).toEqual('valbar')
    })

    it('implicit boolean value', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa
      keybbb
      keyccc = valccc`)

      // act
      const a = config.get('foo.keybbb')

      // assert
      expect(a).toEqual('true')
    })

    it('section case insensitive', () => {
      // arrange
      const config = GitConfig.from(`[Foo]
      keyaaa = valaaa`)

      // act
      const a = config.get('FOO.keyaaa')

      // assert
      expect(a).toEqual('valaaa')
    })

    it('variable name insensitive', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      KeyAaa = valaaa`)

      // act
      const a = config.get('foo.KEYaaa')

      // assert
      expect(a).toEqual('valaaa')
    })

    it('last (when several)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa
      keybbb = valbbb
      keybbb = valBBB`)

      // act
      const a = config.get('foo.keybbb')

      // assert
      expect(a).toEqual('valBBB')
    })

    it('multiple', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa
      keybbb = valbbb
      keybbb = valBBB`)

      // act
      const a = config.getall('foo.keybbb')

      // assert
      expect(a).toEqual(['valbbb', 'valBBB'])
    })

    it('subsection', () => {
      // arrange
      const config = GitConfig.from(`[remote "foo"]
      url = https://foo.com/project.git
      [remote "bar"]
      url = https://bar.com/project.git`)

      // act
      const a = config.get('remote.bar.url')

      // assert
      expect(a).toEqual('https://bar.com/project.git')
    })
  })

  describe('handle comments', () => {
    it('lines starting with # or ;', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      #keyaaa = valaaa
      ;keybbb = valbbb
      keyccc = valccc`)

      // act
      const a = config.get('foo.#keyaaa')
      // assert
      expect(a).toBeUndefined()

      // act
      const b = config.get('foo.;keybbb')
      // assert
      expect(b).toBeUndefined()
    })

    it('variable lines with # or ; at the end (get)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa #comment #aaa
      keybbb = valbbb ;comment ;bbb
      keyccc = valccc`)

      // act
      const a = config.get('foo.keyaaa')
      // assert
      expect(a).toEqual('valaaa')

      // act
      const b = config.get('foo.keybbb')
      // assert
      expect(b).toEqual('valbbb')
    })

    it('variable lines with # or ; at the end (set)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa #comment #aaa
      keybbb = valbbb ;comment ;bbb
      keyccc = valccc`)

      // act
      config.set('foo.keyaaa', 'newvalaaa')
      config.set('foo.keybbb', 'newvalbbb')

      // assert
      expect(config.toString()).toEqual(`[foo]
\tkeyaaa = newvalaaa
\tkeybbb = newvalbbb
      keyccc = valccc`)
    })

    it('ignore quoted # or ;', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa " #commentaaa"
      keybbb = valbbb " ;commentbbb"
      keyccc = valccc`)

      // act
      const a = config.get('foo.keyaaa')
      // assert
      expect(a).toEqual('valaaa  #commentaaa')

      // act
      const b = config.get('foo.keybbb')
      // assert
      expect(b).toEqual('valbbb  ;commentbbb')
    })
  })

  describe('handle quotes', () => {
    it('simple', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = "valaaa"`)

      // act
      const a = config.get('foo.keyaaa')

      // assert
      expect(a).toEqual('valaaa')
    })

    it('escaped', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = \\"valaaa`)

      // act
      const a = config.get('foo.keyaaa')

      // assert
      expect(a).toEqual('"valaaa')
    })

    it('multiple', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = "val" aaa
      keybbb = val "a" a"a"`)

      // act
      const a = config.get('foo.keyaaa')
      // assert
      expect(a).toEqual('val aaa')

      // act
      const b = config.get('foo.keybbb')
      // assert
      expect(b).toEqual('val a aa')
    })

    it('odd number of quotes', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = "val" a "aa`)

      // act
      const a = config.get('foo.keybbb')

      // assert
      expect(a).toBeUndefined()
    })

    it('# in quoted values', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = "#valaaa"`)

      // act
      const a = config.get('foo.keyaaa')

      // assert
      expect(a).toEqual('#valaaa')
    })

    it('; in quoted values', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = "val;a;a;a"`)

      // act
      const a = config.get('foo.keyaaa')

      // assert
      expect(a).toEqual('val;a;a;a')
    })

    it('# after quoted values', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = "valaaa" # comment`)

      // act
      const a = config.get('foo.keyaaa')

      // assert
      expect(a).toEqual('valaaa')
    })

    it('; after quoted values', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = "valaaa" ; comment`)

      // act
      const a = config.get('foo.keyaaa')

      // assert
      expect(a).toEqual('valaaa')
    })
  })

  describe('get cast value', () => {
    it('using schema', () => {
      // arrange
      const config = GitConfig.from(`[core]
      repositoryformatversion = 0
      filemode = true
      bare = false
      logallrefupdates = true
      symlinks = false
      ignorecase = true
      bigFileThreshold = 2`)

      // act
      const a = config.get('core.repositoryformatversion')
      const b = config.get('core.filemode')
      const c = config.get('core.bare')
      const d = config.get('core.logallrefupdates')
      const e = config.get('core.symlinks')
      const f = config.get('core.ignorecase')
      const g = config.get('core.bigFileThreshold')

      // assert
      expect(a).toEqual('0')
      expect(b).toEqual(true)
      expect(c).toEqual(false)
      expect(d).toEqual(true)
      expect(e).toEqual(false)
      expect(f).toEqual(true)
      expect(g).toEqual(2)
    })

    it('special boolean', () => {
      // arrange
      const config = GitConfig.from(`[core]
      filemode = off
      bare = on
      logallrefupdates = no
      symlinks = true`)

      // act
      const a = config.get('core.filemode')
      const b = config.get('core.bare')
      const c = config.get('core.logallrefupdates')
      const d = config.get('core.symlinks')

      // assert
      expect(a).toEqual(false)
      expect(b).toEqual(true)
      expect(c).toEqual(false)
      expect(d).toEqual(true)
    })

    it('numeric suffix', () => {
      // arrange
      const configA = GitConfig.from(`[core]
      bigFileThreshold = 2k`)
      const configB = GitConfig.from(`[core]
      bigFileThreshold = 2m`)
      const configC = GitConfig.from(`[core]
      bigFileThreshold = 2g`)

      // act
      const a = configA.get('core.bigFileThreshold')
      const b = configB.get('core.bigFileThreshold')
      const c = configC.get('core.bigFileThreshold')

      // assert
      expect(a).toEqual(2048)
      expect(b).toEqual(2097152)
      expect(c).toEqual(2147483648)
    })
  })

  describe('insert new value', () => {
    it('existing section', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa`)

      // act
      config.set('foo.keybbb', 'valbbb')

      // assert
      expect(config.toString()).toEqual(`[foo]
\tkeybbb = valbbb
      keyaaa = valaaa`)
    })

    it('existing section (case insensitive)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa`)

      // act
      config.set('FOO.keybbb', 'valbbb')

      // assert
      expect(config.toString()).toEqual(`[foo]
\tkeybbb = valbbb
      keyaaa = valaaa`)
    })

    it('existing subsection', () => {
      // arrange
      const config = GitConfig.from(`[remote "foo"]
      url = https://foo.com/project.git`)

      // act
      config.set('remote.foo.fetch', 'foo')

      // assert
      expect(config.toString()).toEqual(`[remote "foo"]
\tfetch = foo
      url = https://foo.com/project.git`)
    })

    it('existing subsection (case insensitive)', () => {
      // arrange
      const config = GitConfig.from(`[remote "foo"]
      url = https://foo.com/project.git`)

      // act
      config.set('REMOTE.foo.fetch', 'foo')

      // assert
      expect(config.toString()).toEqual(`[remote "foo"]
\tfetch = foo
      url = https://foo.com/project.git`)
    })

    it('existing subsection with dots in key', () => {
      // arrange
      const config = GitConfig.from(`[remote "foo.bar"]
      url = https://foo.com/project.git`)

      // act
      config.set('remote.foo.bar.url', 'https://bar.com/project.git')

      // assert
      expect(config.toString()).toEqual(`[remote "foo.bar"]
\turl = https://bar.com/project.git`)
    })

    it('new section', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa`)

      // act
      config.set('bar.keyaaa', 'valaaa')

      // assert
      expect(config.toString()).toEqual(`[foo]
      keyaaa = valaaa
[bar]
\tkeyaaa = valaaa`)
    })

    it('new subsection', () => {
      // arrange
      const config = GitConfig.from(`[remote "foo"]
      url = https://foo.com/project.git`)

      // act
      config.set('remote.bar.url', 'https://bar.com/project.git')

      // assert
      expect(config.toString()).toEqual(`[remote "foo"]
      url = https://foo.com/project.git
[remote "bar"]
\turl = https://bar.com/project.git`)
    })

    it('new subsection with dots in key', () => {
      // arrange
      const config = GitConfig.from(`[remote "foo"]
      url = https://foo.com/project.git`)

      // act
      config.set('remote.bar.baz.url', 'https://bar.com/project.git')

      // assert
      expect(config.toString()).toEqual(`[remote "foo"]
      url = https://foo.com/project.git
[remote "bar.baz"]
\turl = https://bar.com/project.git`)
    })
  })

  describe('replace value', () => {
    it('simple', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valfoo
      [bar]
      keyaaa = valbar
      keybbb = valbbb`)

      // act
      config.set('bar.keyaaa', 'newvalbar')

      // assert
      expect(config.toString()).toEqual(`[foo]
      keyaaa = valfoo
      [bar]
\tkeyaaa = newvalbar
      keybbb = valbbb`)
    })

    it('simple (case insensitive)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valfoo
      [bar]
      keyaaa = valbar
      keybbb = valbbb`)

      // act
      config.set('BAR.keyaaa', 'newvalbar')

      // assert
      expect(config.toString()).toEqual(`[foo]
      keyaaa = valfoo
      [bar]
\tkeyaaa = newvalbar
      keybbb = valbbb`)
    })

    it('last (when several)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa
      keybbb = valbbb
      keybbb = valBBB`)

      // act
      config.set('foo.keybbb', 'newvalBBB')

      // assert
      expect(config.toString()).toEqual(`[foo]
      keyaaa = valaaa
      keybbb = valbbb
\tkeybbb = newvalBBB`)
    })

    it('subsection', () => {
      // arrange
      const config = GitConfig.from(`[remote "foo"]
      url = https://foo.com/project.git
      [remote "bar"]
      url = https://bar.com/project.git`)

      // act
      config.set('remote.foo.url', 'https://foo.com/project-foo.git')

      // assert
      expect(config.toString()).toEqual(`[remote "foo"]
\turl = https://foo.com/project-foo.git
      [remote "bar"]
      url = https://bar.com/project.git`)
    })
  })

  describe('append a value to existing key', () => {
    it('simple', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valfoo
      [bar]
      keyaaa = valbar
      keybbb = valbbb`)

      // act
      config.append('bar.keyaaa', 'newvalbar')

      // assert
      expect(config.toString()).toEqual(`[foo]
      keyaaa = valfoo
      [bar]
      keyaaa = valbar
\tkeyaaa = newvalbar
      keybbb = valbbb`)
    })

    it('subsection', () => {
      // arrange
      const config = GitConfig.from(`[remote "foo"]
      url = https://foo.com/project.git
      [remote "bar"]
      url = https://bar.com/project.git`)

      // act
      config.append('remote.baz.url', 'https://baz.com/project.git')

      // assert
      expect(config.toString()).toEqual(`[remote "foo"]
      url = https://foo.com/project.git
      [remote "bar"]
      url = https://bar.com/project.git
[remote "baz"]
\turl = https://baz.com/project.git`)
    })
  })

  describe('remove value', () => {
    it('simple', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa
      keybbb = valbbb`)

      // act
      config.set('foo.keyaaa')

      // assert
      expect(config.toString()).toEqual(`[foo]
      keybbb = valbbb`)
    })

    it('simple (case insensitive)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa
      keybbb = valbbb`)

      // act
      config.set('FOO.keyaaa')

      // assert
      expect(config.toString()).toEqual(`[foo]
      keybbb = valbbb`)
    })

    it('last (when several)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valone
      keyaaa = valtwo`)

      // act
      config.set('foo.keyaaa')

      // assert
      expect(config.toString()).toEqual(`[foo]
      keyaaa = valone`)
    })

    it('subsection', () => {
      // arrange
      const config = GitConfig.from(`[remote "foo"]
      url = https://foo.com/project.git
      [remote "bar"]
      url = https://bar.com/project.git`)

      // act
      config.set('remote.foo.url')

      // assert
      expect(config.toString()).toEqual(`[remote "foo"]
      [remote "bar"]
      url = https://bar.com/project.git`)
    })
  })

  describe('handle errors', () => {
    it('get unknown key', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa
      keybbb = valbbb`)

      // act
      const a = config.get('foo.unknown')

      // assert
      expect(a).toBeUndefined()
    })

    it('get unknown section', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa
      keybbb = valbbb`)

      // act
      const a = config.get('bar.keyaaa')

      // assert
      expect(a).toBeUndefined()
    })

    it('get unknown subsection', () => {
      // arrange
      const config = GitConfig.from(`[remote "foo"]
      url = https://foo.com/project.git
      [remote "bar"]
      url = https://bar.com/project.git`)

      // act
      const a = config.get('remote.unknown.url')

      // assert
      expect(a).toBeUndefined()
    })

    it('section is only alphanum _ and . (get)', () => {
      // arrange
      const config = GitConfig.from(`[fo o]
      keyaaa = valaaa
      [ba~r]
      keyaaa = valaaa
      [ba?z]
      keyaaa = valaaa`)

      // act
      const a = config.get('fo o.keyaaa')
      // assert
      expect(a).toBeUndefined()

      // act
      const b = config.get('ba~r.keyaaa')
      // assert
      expect(b).toBeUndefined()

      // act
      const c = config.get('ba?z.keyaaa')
      // assert
      expect(c).toBeUndefined()
    })

    it('section is only alphanum _ and . (set)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valfoo`)

      // act
      config.set('ba?r.keyaaa', 'valbar')

      // assert
      expect(config.toString()).toEqual(`[foo]
      keyaaa = valfoo`)
    })

    it('variable name is only alphanum _ (get)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      key aaa = valaaa
      key?bbb = valbbb
      key%ccc = valccc
      key.ddd = valddd`)

      // act
      const a = config.get('foo.key aaa')
      // assert
      expect(a).toBeUndefined()

      // act
      const b = config.get('foo.key?bbb')
      // assert
      expect(b).toBeUndefined()

      // act
      const c = config.get('foo.key%ccc')
      // assert
      expect(c).toBeUndefined()

      // act
      const d = config.get('foo.key.ddd')
      // assert
      expect(d).toBeUndefined()
    })

    it('variable name is only alphanum _ (set)', () => {
      // arrange
      const config = GitConfig.from(`[foo]
      keyaaa = valaaa`)

      // act
      config.set('foo.key bbb', 'valbbb')
      config.set('foo.key?ccc', 'valccc')
      config.set('foo.key%ddd', 'valddd')

      // assert
      expect(config.toString()).toEqual(`[foo]
      keyaaa = valaaa`)
    })
  })

  describe('get subsections', () => {
    it('simple', () => {
      // arrange
      const config = GitConfig.from(`[one]
      keyaaa = valaaa

      [remote "foo"]
      url = https://foo.com/project.git
      [remote "bar"]
      url = https://bar.com/project.git

      [two]
      keyaaa = valaaa`)

      // act
      const subsections = config.getSubsections('remote')

      // assert
      expect(subsections).toEqual(['foo', 'bar'])
    })
  })

  describe('delete section', () => {
    it('simple', () => {
      // arrange
      const config = GitConfig.from(`[one]
      keyaaa = valaaa
[two]
      keybbb = valbbb`)

      // act
      config.deleteSection('one')

      // assert
      expect(config.toString()).toEqual(`[two]
      keybbb = valbbb`)
    })

    it('subsection', () => {
      // arrange
      const config = GitConfig.from(`[one]
      keyaaa = valaaa

      [remote "foo"]
      url = https://foo.com/project.git
      ; this is a comment

      [remote "bar"]
      url = https://bar.com/project.git`)

      // act
      config.deleteSection('remote', 'foo')

      // assert
      expect(config.toString()).toEqual(`[one]
      keyaaa = valaaa

      [remote "bar"]
      url = https://bar.com/project.git`)
    })
  })
})
