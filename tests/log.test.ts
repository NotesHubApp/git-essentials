import { log } from 'git-essentials'

import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'

import logFsFixtureData from './fixtures/fs/log.json'
import logComplexFsFixtureData from './fixtures/fs/log-complex.json'


describe('log', () => {
  it('HEAD', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFsFixtureData as FsFixtureData)

    // act
    const commits = await log({ fs, dir, ref: 'HEAD' })

    // assert
    expect(commits.length).toBe(5)
    expect(commits).toEqual(
      [
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1501475810,
              "timezoneOffset": 240
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1501475810,
              "timezoneOffset": 240
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----
Version: GnuPG v1

iQIcBAABAgAGBQJZfrPiAAoJEJYJuKWSi6a5r7AP/0iG5t9oO4OFkvxCbhUd5fra
Q2Z/ujck0yJFW3xF/2/Rzi/4PZ93RPhwB/JUVa8I9zPi5mVJMV6+ZoqiRLmgMb8g
RJyw5Umi2JxtkpssaVfd7RUzjPiXBl9fb0lYgZttGf/sUXoEAUtX0hCwFqN/jALZ
R+x6DqQy4XPkRpLJtQ/ABIL6dpRWflQVsONE7a4M/PA/dON4JaoCl9NTEsOPDs+J
uY/dus3C8DTa2cdeb5OCxpjG7uQEzhMF7PfO/j+uAMNh96HVLvZGQcomxDzfglph
EbEYm21QnpfmYCddnrM2TM3CsYnLutnk85nfz8JcaO40H2uBoxXf6iJguTUDeDWx
eUDoQNpegfWf2VqoHqsAPamqEDnKt5sWDfx5GLhM7tkbmCDZYKiCIc6YZX2lySlu
plaAg/NuAETtnHknDABWlVz9TQUrW6VG+iseS/rN+ZvxFQHZQvX3pNLigAa5Ey4T
bYTU2r/JAajb+e91tEV52+ZzF7QO5URhDBQkiSurFV830HfBFBel/TcOvzWvsW8l
gaESl+Pz8194Z/fEfIVec8IeLPURpSfOKzRZRbu80qBwgE6IBbhbiveVKE5TmaLO
OgA2QgYxLNoaP6fR0mzBa/XqVZeTTGUrgPpGprP/AktZdl+8hPT2s8TkeO9wAVL2
PwpokxoC+HRjO+bEBAs5
=n8ff
-----END PGP SIGNATURE-----`,
      "message": `Update gitignore\n`,
            "parent": [
              "ae054080bcfd04c84e0820e0cf74b31f4a422d7c",
            ],
            "tree": "24224c8f5d4cb40dc61f4210e7eb2c964f7e2407",
          },
          "oid": "3c945912219e6fc27a9100bf099687c69c88afed",
          "payload":
`tree 24224c8f5d4cb40dc61f4210e7eb2c964f7e2407
parent ae054080bcfd04c84e0820e0cf74b31f4a422d7c
author Will Hilton <wmhilton@gmail.com> 1501475810 -0400
committer Will Hilton <wmhilton@gmail.com> 1501475810 -0400

Update gitignore\n`
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1501475755,
              "timezoneOffset": 240
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1501475755,
              "timezoneOffset": 240
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----
Version: GnuPG v1

iQIcBAABAgAGBQJZfrOrAAoJEJYJuKWSi6a5VWMP/il3myaUFoxh2DaM/1+F5GFC
OdS+jUheAMak+M8s87kGrH8Fhv+q46RpSIrrQoz9COYM0tBFDygn2xiIdoMgqwP+
uSXVRWzawZS+0T0nYIVCZLAN41iniL6um3XopNExpOF6rzsgi5t4s+Ch2fksOhBz
Ze7jVtFOrmd2O9QlofgM9ICXJDJcrFRd9tPSQO9Nu4sJPpZjcYUfIfOcSIvwrB6p
ySR4Kyh9zrNRxxY8LEbcXZGvet2wvmhBV6oQo1Xh++E5xINvcHHNo0frZl+/wSSm
QpVE4ErEOBKYnjFqrtsdra9fmAa30/gl0pC3kBbAYdqbB1k0LgWeBfZ08Lmw5qON
ZEDzm2jV9PFCuDs6DTk20dguyhIQIvSetpM8LEWUpVSUiXMJkJs48TZ5nTry79me
QHf3gGNTZ6TQ9Wnjj7QXplVHFMbUc/9TJkXwQ1yYiRCY4z6g9j75qEZmhmWcUg5G
1wHb2xcx5uNysb8gFJT4Anb1GL9VdNAy82uaEt7OgpaFozLnqS/ZqZljnM4VUY+e
A0/Fw1cirSCuVCboA3pPNFyD5vrQcYU+RYEyxdMCf9BBO1/Zuf2qfsVOcIr3hGB6
EaqfZgz3hL/6DRoaira+wo6vQWDLDfbkKmJTSVTXO/p9gWhOGo2J1w75fJmmwbte
DW9rcJWg376XhOdUJYjl
=kq+d
-----END PGP SIGNATURE-----`,
            "message": `Finished implementing fetching trees and blobs from Github API, even if we can't push to it.\n`,
            "parent": [
              "3e80cede3c2a753a5272ed4d93496b67bb65cb0d",
            ],
            "tree": "6b858a95cc8e87677aff79a645ae178923caa5f5",
          },
          "oid": "ae054080bcfd04c84e0820e0cf74b31f4a422d7c",
          "payload":
`tree 6b858a95cc8e87677aff79a645ae178923caa5f5
parent 3e80cede3c2a753a5272ed4d93496b67bb65cb0d
author Will Hilton <wmhilton@gmail.com> 1501475755 -0400
committer Will Hilton <wmhilton@gmail.com> 1501475755 -0400

Finished implementing fetching trees and blobs from Github API, even if we can't push to it.\n`
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1501462174,
              "timezoneOffset": 240
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1501462174,
              "timezoneOffset": 240
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----
Version: GnuPG v1

iQIcBAABAgAGBQJZfn6eAAoJEJYJuKWSi6a5H/wP/0iG/chGZyd1b0ZIpI43saW9
GzGZsKMgUmCmy+CWPIUDJ5p6p045xBDwRrMqdKPvDsJrpDmcUvV8usbL3nQWKvZj
oeSeOvC4C6yw6k66Zr0YtCrcAjqfAUAsyEdiZ+7JNigDB9MqUufw2sYurlulYtBu
2zv22QIep5AYG0pDhSWFbeNuzesL+uk1sxoGTqQN7ER/qnKPWPQwMBNezpA65a3O
WgH2lnPpyDPc6S356Nkr8f9fvQMxx66vXdR07cIw9gsA6dzgW+aUC9w4rAZ9Afk2
SPsARmm8DH1vwwQMbiVzcKuvZ5/yWpy2XJjR2v/IhtD8dtYZDAlUbq+5jIpS9eoa
046xp7GJ5cawOXhoWJfpvmj9ozFkQA8yZvNQ/DmUX7mrknR3pvOuxKFd/WAHZ0R/
M696r6MIbAWWmy6/g76qcj//oEhlTWiaoxqBL5HNxRIAJzhM8gGBmtv7L+mSxKtb
b5foIdbQZ/s890Cnm632KxTQdPkVwInP7oratrYsvpXoe+X6/EOYvhPZYaFARm+C
KS0bq7XbfGxgswD7/6rOjOL4G3WNs0eBBf4KTOZQ4HLM72cjgcMsSSgHMUarLfCo
KLW+2DEuHJhzF4yBcR9uSUdT0t/BbqXpRwNL0QI8nOKmvbuZqMkDHJZHOCqbjn+8
hkMXWZGGpdRSNcNY9Hw8
=VFL/
-----END PGP SIGNATURE-----`,
            "message": `My oh shit moment\n`,
            "parent": [
              "1c04ba2c3b7c61cdfc0ddc3f9515116bc0e06863",
            ],
            "tree": "d1a3e8c5371d481b54e32916da162e08a87ad294",
          },
          "oid": "3e80cede3c2a753a5272ed4d93496b67bb65cb0d",
          "payload":
`tree d1a3e8c5371d481b54e32916da162e08a87ad294
parent 1c04ba2c3b7c61cdfc0ddc3f9515116bc0e06863
author Will Hilton <wmhilton@gmail.com> 1501462174 -0400
committer Will Hilton <wmhilton@gmail.com> 1501462174 -0400

My oh shit moment\n`
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1501454660,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1501454660,
              "timezoneOffset": 240,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----
Version: GnuPG v1

iQIcBAABAgAGBQJZfmFEAAoJEJYJuKWSi6a5UeUP/3H2AdaOG5g1awkyHSC7sax9
ZAQZhHumcufXoe4jNlKNogk0SUNud7H9dbhG3D7pbpujrLfjPPQ5rrQ5k2RdbuzR
/YRuPPv9fdukWSCX3tXp63BzeNF18i/scIODgX2tT3RmihRldSWopgGpfRnks9o1
cTAhmhjEIOH2wNki7u0M9WT6ntSUw99kglZ2vQGlExp97NFuVS68LsGjdlOpL/Lx
kYxZUap5NVU1CFQZRgeSKZYKGVanuAbSFrGp5dHdY33YXxUQ2POzzH/sZIRRvnFZ
T11K4AN4O7NhO0nujJS9VDrNgU20Kxwxl9FsVMwjSDdlf8ZROVbkse1U/pGjchwN
V+1j3wMzbu0AHCcqkMB5zny/6fLrZigclOTXgq/zFiwh4FjMYwraGIKIYpTWYQ65
d+BfM3nb7j6otAQvrxiIyNe7dwWPI39OZeFk6krAQNg1Lm1cxWwqWiWgXpZAmQwd
yNlgQ9WLjZqiKUI8uxYJB3IznpDjIvO7t8Fq2EmDF0L4/t2LTD4JIGPOlKBx0Abr
5J9lI+2GLTk1ZRPpDk/7w/UJpSxoeGyo5+bI9RaWQRgzkpSLyPTlvipuBLgZefj2
njEC13b2FdnupU2qhjTqptwh1t5qrOQ4COYehMFJyhHllu/S1gV53pdBQ3N1sw35
R4YVFfBN+FJiRwiGq3vn
=zxDV
-----END PGP SIGNATURE-----`,
            "message": `Git init, and parts of git fetch\n`,
            "parent": [
              "1e40fdfba1cf17f3c9f9f3d6b392b1865e5147b9",
            ],
            "tree": "dd92ed7e55ddc0c74f467a8899cc281d909c6bb9",
          },
          "oid": "1c04ba2c3b7c61cdfc0ddc3f9515116bc0e06863",
          "payload":
`tree dd92ed7e55ddc0c74f467a8899cc281d909c6bb9
parent 1e40fdfba1cf17f3c9f9f3d6b392b1865e5147b9
author Will Hilton <wmhilton@gmail.com> 1501454660 -0400
committer Will Hilton <wmhilton@gmail.com> 1501454660 -0400

Git init, and parts of git fetch\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1501381894,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1501381894,
              "timezoneOffset": 240,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----
Version: GnuPG v1

iQIcBAABAgAGBQJZfUUGAAoJEJYJuKWSi6a51VIQAJPwVk7bFWbNoLbi9Hi931k3
E6kGW8JnWwcT6Y7fpm0oNpoXt+UzqJdUhVTi+79ws3yKc0u1cA23nVXDUQYmNBT7
3YkzXP2b6OE8i7n0ffzWbOIwHqWPn7lm0RlssSEYMAwGzDTP4fj2isRCFBqQ2lb3
dqp7ZbzikvkkQONs9AKpE7LpWYTVuyElBwO2RtlIcZQrs29fBxZg4q4fkF+mqOhp
DMWMIvTNeCa35sjmWh4+iPXO2CtoYVKXfCzZStzleeCuwQGRhfCLxrxtcuXOREjG
DilGnCZ0iM9+ClzD4wDUf/aY3F5exyq2oqktIq78EhFvIIozY+gUaTn6zXicr5ud
30QQP063Tf8wC3Cy95aEq9QqLYkMXhOYBDym5fWawEWo7ssmOIW1o0ISfSI8pTVZ
bZr5f9gQZETlTWhSPh5IGqqdHrI2fw5pkmO1N/OEn4L8D7R8josty28V4+wk2gsO
wUSPyBv7EpVx2JtO+9Wu941fZK2qOBBmTjcTYys9PQeY9UHtrTQ3y/1r/qdLpdUH
9HK/x5yNHqpnSATHpRiZnfkvKfaxxwIbaOLBPV8khPa/zu9dD+0WxDXStLVBWfXg
MvYAu4q+mQSgON1Qu+kWg67lNhx//kRH0K+vUMJMIvc8M+yUgkJhRqH/HIEzEcJV
ee4fN2IIWX0CTNr8Fs8a
=0Txp
-----END PGP SIGNATURE-----`,
            "message": `Initial commit\n`,
            "parent": [],
            "tree": "421909592ea5e22c6dda69d1cc85118240478444",
          },
          "oid": "1e40fdfba1cf17f3c9f9f3d6b392b1865e5147b9",
          "payload":
`tree 421909592ea5e22c6dda69d1cc85118240478444
author Will Hilton <wmhilton@gmail.com> 1501381894 -0400
committer Will Hilton <wmhilton@gmail.com> 1501381894 -0400

Initial commit\n`,
        },
      ])
  })

  it('HEAD depth', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFsFixtureData as FsFixtureData)

    // act
    const commits = await log({ fs, dir, ref: 'HEAD', depth: 1 })

    // assert
    expect(commits.length).toBe(1)
  })

  it('HEAD since', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFsFixtureData as FsFixtureData)

    // act
    const commits = await log({ fs, dir, ref: 'HEAD', since: new Date(1501462174000) })

    // assert
    expect(commits.length).toBe(2)
  })

  it('shallow branch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFsFixtureData as FsFixtureData)

    // act
    const commits = await log({ fs, dir, ref: 'origin/shallow-branch' })

    // assert
    expect(commits).toEqual(
      [
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1502484200,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "Will Hilton",
              "timestamp": 1502484200,
              "timezoneOffset": 240,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----
Version: GnuPG v1

iQIcBAABAgAGBQJZjhboAAoJEJYJuKWSi6a5V5UP/040SfemJ13PRBXst2eB59gs
3hPx29DRKBhFtvk+uS+8523/hUfry2oeWWd6YRkcnkxxAUtBnfzVkI9AgRIc1NTM
h5XtLMQubCAKw8JWvVvoXETzwVAODmdmvC4WSQCLu+opoe6/W7RvkrTD0pbkwH4E
MXoha59sIWZ/FacZX6ByYqhFykfJL8gCFvRSzjiqBIbsP7Xq2Mh4jkAKYl5zxV3u
qCk26hnhL++kwfXlu2YdGtB9+lj3pk1NeWqR379zRzh4P10FxXJ18qSxczbkAFOY
6o5h7a/Mql1KqWB9EFBupCpjydmpAtPo6l1Us4a3liB5LJvCh9xgR2HtShR4b97O
nIpXP4ngy4z9UyrXXxxpiQQn/kVn/uKgtvGp8nOFioo61PCi9js2QmQxcsuBOeO+
DdFq5k2PMNZLwizt4P8EGfVJoPbLhdYP4oWiMCuYV/2fNh0ozl/q176HGszlfrke
332Z0maJ3A5xIRj0b7vRNHV8AAl9Dheo3LspjeovP2iycCHFP03gSpCKdLRBRC4T
X10BBFD8noCMXJxb5qenrf+eKRd8d4g7JtcyzqVgkBQ68GIG844VWRBolOzx4By5
cAaw/SYIZG3RorAc11iZ7sva0jFISejmEzIebuChSzdWO2OOWRVvMdhyZwDLUgAb
Qixh2bmPgr3h9nxq2Dmn
=4+DN
-----END PGP SIGNATURE-----`,
            "message": `Improve resolveRef to handle more kinds of refs. Add tests\n`,
            "parent": [
              "b4f8206d9e359416b0f34238cbeb400f7da889a8",
            ],
            "tree": "e0b8f3574060ee24e03e4af3896f65dd208a60cc",
          },
          "oid": "e10ebb90d03eaacca84de1af0a59b444232da99e",
          "payload":
`tree e0b8f3574060ee24e03e4af3896f65dd208a60cc
parent b4f8206d9e359416b0f34238cbeb400f7da889a8
author Will Hilton <wmhilton@gmail.com> 1502484200 -0400
committer Will Hilton <wmhilton@gmail.com> 1502484200 -0400

Improve resolveRef to handle more kinds of refs. Add tests\n`,
        },
      ])
  })

  it('has correct payloads', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFsFixtureData as FsFixtureData)

    // act
    const commits = await log({ fs, dir, ref: 'HEAD' })

    // assert
    expect(commits.length).toBe(5)
  })

  it('with complex merging history', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logComplexFsFixtureData as FsFixtureData)

    // act
    const commits = await log({ fs, dir, ref: 'main' })

    // assert
    expect(commits).toEqual(
      [
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605340,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605340,
              "timezoneOffset": 240,
            },
            "message": `Merge branches 'foo' and 'baz'\n`,
            "parent": [
              "8bb702b66d8def74b2a9642309eb23a5f76779dc",
              "ccc9ef071f1b27210fa0df2f8665f4ad550358e8",
              "1ce759dd468c1ea830e8befbbdcf79e591346153",
            ],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "9eeab5143ea4a6dde4ede004e4882e2467dde340",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent 8bb702b66d8def74b2a9642309eb23a5f76779dc
parent ccc9ef071f1b27210fa0df2f8665f4ad550358e8
parent 1ce759dd468c1ea830e8befbbdcf79e591346153
author William Hilton <wmhilton@gmail.com> 1528605340 -0400
committer William Hilton <wmhilton@gmail.com> 1528605340 -0400

Merge branches 'foo' and 'baz'\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605325,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605325,
              "timezoneOffset": 240,
            },
            "message": `Other sixth commit\n`,
            "parent": [
              "f1eca35203ee2b578f23e0e7c8b8c2c48927d597",
            ],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "8bb702b66d8def74b2a9642309eb23a5f76779dc",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent f1eca35203ee2b578f23e0e7c8b8c2c48927d597
author William Hilton <wmhilton@gmail.com> 1528605325 -0400
committer William Hilton <wmhilton@gmail.com> 1528605325 -0400

Other sixth commit\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605315,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605315,
              "timezoneOffset": 240,
            },
            "message": `Sixth commit\n`,
            "parent": [
              "f1eca35203ee2b578f23e0e7c8b8c2c48927d597",
            ],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "1ce759dd468c1ea830e8befbbdcf79e591346153",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent f1eca35203ee2b578f23e0e7c8b8c2c48927d597
author William Hilton <wmhilton@gmail.com> 1528605315 -0400
committer William Hilton <wmhilton@gmail.com> 1528605315 -0400

Sixth commit\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605295,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605295,
              "timezoneOffset": 240,
            },
            "message": `Fifth commit\n`,
            "parent": [
              "6cabb8ab77d3fc40858db84416dfd1a41fe1c2fd",
            ],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "f1eca35203ee2b578f23e0e7c8b8c2c48927d597",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent 6cabb8ab77d3fc40858db84416dfd1a41fe1c2fd
author William Hilton <wmhilton@gmail.com> 1528605295 -0400
committer William Hilton <wmhilton@gmail.com> 1528605295 -0400

Fifth commit\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605245,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605245,
              "timezoneOffset": 240,
            },
            "message": `Merge branch 'bar' into foo\n`,
            "parent": [
              "ad5f1992b8ff758bc9fe457acf905093dd75b7b1",
              "ec2db34cd04249ea6c31ed6d367656b0f2ab25c6",
            ],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "ccc9ef071f1b27210fa0df2f8665f4ad550358e8",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent ad5f1992b8ff758bc9fe457acf905093dd75b7b1
parent ec2db34cd04249ea6c31ed6d367656b0f2ab25c6
author William Hilton <wmhilton@gmail.com> 1528605245 -0400
committer William Hilton <wmhilton@gmail.com> 1528605245 -0400

Merge branch 'bar' into foo\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605228,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605228,
              "timezoneOffset": 240,
            },
            "message": `Other fourth commit\n`,
            "parent": [
              "b5129e2726d68c93ed09a3eaec9dda5e76fd4a87",
            ],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "ec2db34cd04249ea6c31ed6d367656b0f2ab25c6",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent b5129e2726d68c93ed09a3eaec9dda5e76fd4a87
author William Hilton <wmhilton@gmail.com> 1528605228 -0400
committer William Hilton <wmhilton@gmail.com> 1528605228 -0400

Other fourth commit\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605214,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605214,
              "timezoneOffset": 240,
            },
            "message": `Fourth commit\n`,
            "parent": [
              "c4e447f61fcaf49032265bfe3dea32383339d910",
            ],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "ad5f1992b8ff758bc9fe457acf905093dd75b7b1",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent c4e447f61fcaf49032265bfe3dea32383339d910
author William Hilton <wmhilton@gmail.com> 1528605214 -0400
committer William Hilton <wmhilton@gmail.com> 1528605214 -0400

Fourth commit\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605200,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605200,
              "timezoneOffset": 240,
            },
            "message": `Other third commit\n`,
            "parent": [
              "6cabb8ab77d3fc40858db84416dfd1a41fe1c2fd",
            ],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "b5129e2726d68c93ed09a3eaec9dda5e76fd4a87",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent 6cabb8ab77d3fc40858db84416dfd1a41fe1c2fd
author William Hilton <wmhilton@gmail.com> 1528605200 -0400
committer William Hilton <wmhilton@gmail.com> 1528605200 -0400

Other third commit\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605169,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605169,
              "timezoneOffset": 240,
            },
            "message": `Third commit\n`,
            "parent": [
              "6cabb8ab77d3fc40858db84416dfd1a41fe1c2fd",
            ],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "c4e447f61fcaf49032265bfe3dea32383339d910",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent 6cabb8ab77d3fc40858db84416dfd1a41fe1c2fd
author William Hilton <wmhilton@gmail.com> 1528605169 -0400
committer William Hilton <wmhilton@gmail.com> 1528605169 -0400

Third commit\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605133,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605133,
              "timezoneOffset": 240,
            },
            "message": `Second commit\n`,
            "parent": [
              "4acc58cd881f48c4662c4554ab268e77bcd34b71",
            ],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "6cabb8ab77d3fc40858db84416dfd1a41fe1c2fd",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
parent 4acc58cd881f48c4662c4554ab268e77bcd34b71
author William Hilton <wmhilton@gmail.com> 1528605133 -0400
committer William Hilton <wmhilton@gmail.com> 1528605133 -0400

Second commit\n`,
        },
        {
          "commit": {
            "author": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605128,
              "timezoneOffset": 240,
            },
            "committer": {
              "email": "wmhilton@gmail.com",
              "name": "William Hilton",
              "timestamp": 1528605128,
              "timezoneOffset": 240,
            },
            "message": `Initial commit\n`,
            "parent": [],
            "tree": "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
          },
          "oid": "4acc58cd881f48c4662c4554ab268e77bcd34b71",
          "payload":
`tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
author William Hilton <wmhilton@gmail.com> 1528605128 -0400
committer William Hilton <wmhilton@gmail.com> 1528605128 -0400

Initial commit\n`,
        },
      ])
  })
})
