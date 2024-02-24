import { FsFixtureData, makeFsFixture } from './helpers/makeFsFixture'

import { NotFoundError } from 'git-essentials/errors'
import { expectToFailWithTypeAsync } from './helpers/assertionHelper'
import { log } from 'git-essentials'
import logComplexFsFixtureData from './fixtures/fs/log-complex.json'
import logFileFsFixtureData from './fixtures/fs/log-file.json'
import logFsFixtureData from './fixtures/fs/log.json'

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

describe('log-file', () => {
  it('a newly added file', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFileFsFixtureData as FsFixtureData)

    // act
    const commits = await log({
      fs,
      dir,
      ref: 'HEAD',
      filepath: 'newfile.md',
    })

    // assert
    expect(commits.length).toBe(2)
    expect(commits).toEqual(
      [
        {
          "commit": {
            "author": {
              "email": "araknast@protonmail.com",
              "name": "araknast",
              "timestamp": 1653969605,
              "timezoneOffset": 420,
            },
            "committer": {
              "email": "araknast@protonmail.com",
              "name": "araknast",
              "timestamp": 1653969605,
              "timezoneOffset": 420,
            },
            "message": "update newfile\n",
            "parent": [
              "dcb1c5fe6cc28e7757c4bc4d7dbf5b061c38ec48",
            ],
            "tree": "331f342f6e9b38c45e17189691134cb4a72189d2",
          },
          "oid": "04833cdb10e0f8fa81800cafa98e1381a1c6c58e",
          "payload":
`tree 331f342f6e9b38c45e17189691134cb4a72189d2
parent dcb1c5fe6cc28e7757c4bc4d7dbf5b061c38ec48
author araknast <araknast@protonmail.com> 1653969605 -0700
committer araknast <araknast@protonmail.com> 1653969605 -0700

update newfile\n`,
        },
        {
          "commit": {
            "author": {
              "email": "araknast@protonmail.com",
              "name": "araknast",
              "timestamp": 1653969041,
              "timezoneOffset": 420,
            },
            "committer": {
              "email": "araknast@protonmail.com",
              "name": "araknast",
              "timestamp": 1653969041,
              "timezoneOffset": 420,
            },
            "message": "add newfile\n",
            "parent": [
              "18f202dfed5cb66a295dc57f1f4ba1b7f6b74f36",
            ],
            "tree": "59c1caba006bb27077d11f1c0ff7ad3ff4b2b422",
          },
          "oid": "dcb1c5fe6cc28e7757c4bc4d7dbf5b061c38ec48",
          "payload":
`tree 59c1caba006bb27077d11f1c0ff7ad3ff4b2b422
parent 18f202dfed5cb66a295dc57f1f4ba1b7f6b74f36
author araknast <araknast@protonmail.com> 1653969041 -0700
committer araknast <araknast@protonmail.com> 1653969041 -0700

add newfile\n`,
        },
      ])
  })

  it('a file only', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFileFsFixtureData as FsFixtureData)

    // act
    const commits = await log({
      fs,
      dir,
      ref: 'HEAD',
      filepath: 'README.md',
    })

    // assert
    expect(commits.length).toBe(3)
    expect(commits).toEqual(
      [
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509836,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509836,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77B8wACgkQEPFehIUs
uGi0CQ//ciB5DDcHppFv1caaOiEYUos8oc871eMMbXtl+y9eTfzN6VEwpXY8matE
3hxMpe4YAUpivfQ3a75d5MEy5iEpF/U9rCkWBlGpdqG3+rvmrvpQXo+PZEzdP84E
7rz1Ue2PnfivXCzo2zvDoyMLWqFbNgxXIwr0ST2SxuBTsVIwF/6y80uXa/8VQXfK
MBCFKKcBK03ruZAWiLIwMNvYTxDIMvupRIN2rzyRpOb8lCSWmyw1/eqzF5soVy62
HraCZlK1iyv9XaL0qn+SlAGYYsJylp8sfLUmU0y2qeEtLYdRLS25yRAK9h7l5RD2
qTmQwPb5vx1ldFALr90qgVZc3j7xI5xnL6UtiMGSoZM+HuJ3eioOisXf0aAaxr6U
ImY98WAIPuAAx6rUhHP27r0w0hDABFZmrMtO7FkH6wcqM2LJIweLGFZtKXePmR14
CH4cQw4ylSjtrcQFguUF7rvz0sX69IeDTTF2ppaH9uQclL+3F0Bj78XiH9Dflx4E
6+HfY98tdLPcjGfcdAguLBbKZslmYz7uUeqvHyrgVER6xMFcrGR7IUPLI0IWjtqY
CL+5+gxD2O4FIUhY2hwISLHx+cWsCsAmiBZKx5OhQeW9nn4D8ex4WQK/go7iCrEe
LnuTba+0qmNBTF7f7a+U0x1ReeipUk19bEuP7P1K7Ppc1C+BYT4=
=nAWS
-----END PGP SIGNATURE-----`,
            "message": "feat: update to readme and hi.md\n",
            "parent": [
              "8e98db35c3e3e01014f78a60786b1b3b96a49960",
            ],
            "tree": "281d4cba64e37323777e7f3ee222d504ed8fa0ea",
          },
          "oid": "bba48a582aaa7e572c844cf7f42f3cd03eab81f0",
          "payload":
`tree 281d4cba64e37323777e7f3ee222d504ed8fa0ea
parent 8e98db35c3e3e01014f78a60786b1b3b96a49960
author Riceball LEE <snowyu.lee@gmail.com> 1593509836 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593509836 +0800

feat: update to readme and hi.md\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509669,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509669,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77ByUACgkQEPFehIUs
uGjJYQ/9HNh4TJO/V+ckTyMDzf+Z4Aih6ytn63ispZnfbKb5hPEV+eG1HRuPthF4
kNilem8w//QYbllbih9bbw3tKvh2SaWYHIOEDI6eA/1k5Bd0nYLi5HNWZG+bOZNR
XdDI+yPBAQSl4607S2xGeOH7HrSzVSVbheDjNhwYBiRDOvbFxhx3Sc/G+vO8IfdU
MCLzVhwizNNclKIMWKaUSpBpJuqxsRK4oINT8wJQLB4LRQ/M2CXgjSjZt0e9NtFl
+6OxGKBbgioNMg6TXzvmqFJ4eqGk1tgMz/qYX1zjCRR2jZ1g/anht8OJRppdz2/0
k87EN+lLpN5H/Z2tSJMrKBHaCJWo72vrcyQzpLjtVUVdHNdOB66+60yqSDZiz7pc
1ou/9jM3cbtEwtvaD+W/JJvG7ctFOM7efM3iGghW2jccJ7Ku/DIlxwCXE6HNCjDf
azPFqO0Y9fw7ZoJl+D7sotea2xaWMhxspUoHxtnYxah6tzJ6KQ8eZ4GR8FoMw2dj
szUaHVtLRg+Nx/G5YWimOFNUrgA3lQYjh9+fgvodxhIQvd9KVW/qCdX6ZQM9vDXU
o9d+QEdd/hzkMrOEHscT3nqKgeIEj6JSBg27kDraM6L0dAP4wCN/9h2dbR2ke0j2
im+CRYtkgJz5EpJ4uN1B7SDUvdBrjYIzC2Aqiohh6M2ehP1in7g=
=IvVn
-----END PGP SIGNATURE-----`,
            "message": "feat: update to README\n",
            "parent": [
              "533131624898bb8ff588b48c77b26d63e7eb180f",
            ],
            "tree": "2ed69fff23ee6e239744c7277ab80bf40a644ece",
          },
          "oid": "37c51dcbe78dd2fbdca15cf74c6c540f879a5bbb",
          "payload":
`tree 2ed69fff23ee6e239744c7277ab80bf40a644ece
parent 533131624898bb8ff588b48c77b26d63e7eb180f
author Riceball LEE <snowyu.lee@gmail.com> 1593509669 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593509669 +0800

feat: update to README\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509547,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509547,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77BqsACgkQEPFehIUs
uGj/oRAAmOMhskEjKwcFaEnC7InU/UMd4PHAy3XlKwqUCiQVEJWWi6B81n5IYsWi
mDOKXGYenlYOAf0HFqs7nPBeINDRFQp03d01wZT7JgacpERCvvu53IHLH8ndJehL
MQaRtWV/SpScj4OZH4Wzm6tjB4IBB/agZWM67tU4KKI2i6TOhQw8ktBoXbXGWO9g
OwjHW4mZn5eggIhyNzNKWRwzImopYlcBGqtYil5l4LWXADBfxAYfBCA296HkiD1N
sFzsi5mak7bKyW5/dFI9uP27BQSLLbGdbJIJlkYXi8XIo/sLPJGA0BHuiNLAVXUn
E/CO4hBH/tZtJNk3jg0TPLey4Lh34d3Tw8+6z6CvMKQtZ9JUXy8rAWMvAXg0+YVp
IvT+xA6HxECuBZ6UAYLU1ZHAvQtZch6XhJTirOJ5SMklTNKSiGaCLfDP/iuRWOYo
4x52uwkInIuintkcIZocjwEQ5DsG6jO4ylbwmEaWgpzEuR7xOuIBx38dsCoSDD+D
kyZF7ijammlt5Wc6A2u7ewEgCEy/GMEMJ+hUXqhJJ9Gi2uYU/WmC9GJDqD12JsEa
m6FFvEd+zCH/9K+O5eBUS9WFpiwXPP+amaXGBWkXnlbEYf/j9QemZXi/dkn1qCE7
yM9yzr8Tb0dJWqvovK42AlCuYsZ9BYOBM3zz+pGhpSdES9OYO08=
=/hmk
-----END PGP SIGNATURE-----`,
            "message": "first commit\n",
            "parent": [],
            "tree": "5640888e247e986136d36b1d52a9881abc7170f6",
          },
          "oid": "8651dcc28c58d96439e99aa2bf239bf2ab238b73",
          "payload":
`tree 5640888e247e986136d36b1d52a9881abc7170f6
author Riceball LEE <snowyu.lee@gmail.com> 1593509547 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593509547 +0800

first commit\n`,
        },
      ]
    )
  })

  it('a deleted file without force should throw error', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFileFsFixtureData as FsFixtureData)

    // act
    const action = async () => {
      await log({
        fs,
        dir,
        ref: 'HEAD',
        filepath: 'a/b/rm.md',
      })
    }

    // assert
    await expectToFailWithTypeAsync(action, NotFoundError)
  })

  it('a deleted file forced', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFileFsFixtureData as FsFixtureData)

    // act
    const commits = await log({
      fs,
      dir,
      ref: 'HEAD',
      filepath: 'a/b/rm.md',
      force: true,
    })

    // assert
    expect(commits.length).toBe(6)
    expect(commits).toEqual(
      [
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593652995,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593652995,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl79NwMACgkQEPFehIUs
uGh+EA//f+cNby3i8IhD5LL5elmR6qp+KFNLQMEa7nvcUmYQX2Ffx4QAN0WtPQ+O
y6PmrQg5MLfCPzANthY3oKnkvjIYbpnBF2JTeN2HA8mF8/HtGakMfeykkeuaGP6V
Kdk4I2jiXC22g/Zy7VAzbYdJTk96yWw71lpufQa1voy8ykCCu/YgeO4EjQME2RYn
82W9+X4Qxx5bu0C0lKMwfdhAcR/MDTye0jbu33krwnuXsNyA+6OKBIOfIAWK8PWY
iTwvkfQ+61T0dGFAdi8tJCfGZ6JRBf482KHR/gSwmwq59g7quS/snnybB6kGwrqZ
tScHZ6Sy08xHYRbibV8HmOAyIBKZr1ZPtEjBx5Aj6Q4qKsTkZ3Q5ZTTi8Ayhm1SM
y1mJ20d3B0WM9F48w0a8qbKxNn7zefW88QHq3PB6wdGechkZ/Wq0xN2z/h3Sl5W3
ZSmJcvgMFJwc/p7ci2spkR+ibVnFNdvn0xinUvrJGftFuiEqlZfHwo1t6KkmX9st
X7+30WwKmotxgeBfV0g1Br4YpaZTKJc5V2JkU+gtjnIlb/7XU6eWm+vCInad5QdL
NeiYCPsrT9ejboKghAIteNNfiuauiRnpZ/06H5gi2OVeyChA1urD/pKjJyaNllbh
XZTv9Wqzt6oQzR6FV0HH5H9ACqOnCJXsTUoydzt843MFHmPDL0Y=
=77Yr
-----END PGP SIGNATURE-----`,
            "message": "redel rm.md\n",
            "parent": [
              "91e66ded3cee73f5f181fbd0e7a4703f1c12bb9f",
            ],
            "tree": "7ab59df3bfd122ef5d24c70f9c8977f03b35e720",
          },
          "oid": "9a4eb099547166c9cf28628a127cfc9e59fa4f29",
          "payload":
`tree 7ab59df3bfd122ef5d24c70f9c8977f03b35e720
parent 91e66ded3cee73f5f181fbd0e7a4703f1c12bb9f
author Riceball LEE <snowyu.lee@gmail.com> 1593652995 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593652995 +0800

redel rm.md\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593652652,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593652652,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl79NawACgkQEPFehIUs
uGj7BRAAjZjpjaP6Kl++qtsHS5GdzMCVyocVOE+UCOWU55ImjJI9g2ajlnWfIUuM
oZTFCG123eY0vGtXTCpcrNUPO3QvVtkIlZybMMFcJJMoENWjQ1rWZEVX4UK/skkM
kKt1ZFVJHfgLnqsFGcyR5Fmr9omm3faVinyIxQhhdNxIYV44x4Uj5IszZul4yeQr
NBdrPpmChT53ST3+WNp1/c7iSeMjUpXO+CVkmmG0kieThJgKBqkBTlholwYrVCgS
B5MTgVzLh9NGoJHs+9Qd5pze41tIPNJbCWtWimoOdWJTo91L29qT747tNC14v6zh
dkemZgUsO81lq96WiTekDS2E9PDWVWk1mi2XAXrsQ8OqDKYDwkLQa4GvlxjQrNEU
1FG0btHD0ddYYEwBN4uK5wsXA60i1qDetggGT+CcYi2yX4MqFCI4GJgf4Oj0htht
ltX7fMFZu5sKSOd1vLE8RxS2c4IgNQZ4ZFCAW1mfBAV31RLXG4BH1f/4laKvMrKO
5EUufJcPIW4vKAXVVGyPMgenkEUrXL/ImYt1kuSAMx2pffahWQzaF7rTXAWO2YK+
bqajFbubxMPbDPW70pnYQJLwuLve2IqBbPsMghx+B30F0PzCajg3XvJv7ZdqodSE
wKn2DCea/8Rj7O/GYRPJJtJ8ITwhGMLxRC5s7j6mJAxj5IdB2fw=
=z3mu
-----END PGP SIGNATURE-----`,
            "message": "feat: readd the rm.md\n",
            "parent": [
              "1bc226bc219beea3fb177de96350d8ad2f4c57cd",
            ],
            "tree": "e7bd10ca01b3377fa6fbe633ce104698b5d7dd29",
          },
          "oid": "91e66ded3cee73f5f181fbd0e7a4703f1c12bb9f",
          "payload":
`tree e7bd10ca01b3377fa6fbe633ce104698b5d7dd29
parent 1bc226bc219beea3fb177de96350d8ad2f4c57cd
author Riceball LEE <snowyu.lee@gmail.com> 1593652652 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593652652 +0800

feat: readd the rm.md\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509970,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509970,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77CFIACgkQEPFehIUs
uGicBhAAr9NDElwaYSoKk8ayUnlO00E/Kr555Xr+/U0wgfXBoVJoDbVSsIi3IhzZ
vkWJXVeb1puUyyhYR4o2gdySJ3u3kcpj1xLIeXp+gvNftJyOaCN04m6Hnay2eMXS
9vZX55PppFXS0B1lB9L95k6ciJEVnoKjEVT1mDunmo1G932qrs6QkU0smKJ7M6fm
cEonSzi+VCpcACs4toN4PMhrFdPvFEvYK0iG8LXxLkKV+bhmKPeD45TKhJTAfjvV
86SltUU1ftyJTu2FxsuWeMzxAw57bI/xET4eHVboOnWp3cSPAWX2Mc5H5yWBzRZy
cPwDIwwvj0WSOtXOWJMW743O+29sNSKZZjoLjrSpwrYWnNYT4ThzdGvKvl2XD9uM
vzZWgQihdT+My0qXLVuDMAnH56jeUN/fdiBw2oxK+sDMiwssD4Y3GulTQ7o067aU
dqVCeV0LXTXmLUCvkbSwbKnxRRRxdA/OowH0NDbaYyjMoZ7UqBYiF5M9W1bcB9Op
RCAfWVB7U7gwgu0PO70g6+LUr1lS+1UnszIvopwsqo301O1qTQBzM4ftuBwQa57P
SHDxCpZ7bBObayNmW+PLkZSwc/Ak+uGzJdJkVrOA0kq2rlsLxnbysj1XxohIQsnQ
+RZMMYcW8eev2DeDB+vtr94O8bxQZOH3cfx5gbxvRX5ixG5dn44=
=8VVM
-----END PGP SIGNATURE-----`,
            "message": "fix: remove rm.md\n",
            "parent": [
              "58aa7508ff84bc25552b4576b1b5ab0ddc5e41dd",
            ],
            "tree": "b0904e4ea2e2548d0ebc5c9401b8a0390c0888cd",
          },
          "oid": "2584400512051e6cb07fda5ff7e8dde556fc3124",
          "payload":
`tree b0904e4ea2e2548d0ebc5c9401b8a0390c0888cd
parent 58aa7508ff84bc25552b4576b1b5ab0ddc5e41dd
author Riceball LEE <snowyu.lee@gmail.com> 1593509970 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593509970 +0800

fix: remove rm.md\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509879,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509879,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77B/cACgkQEPFehIUs
uGj+hxAAhidyrgiKXUdOh038Wvho48rd0opD2b+1C5kUpjSIrnd+7zKAS34Grveo
wjdUsk4/Ao/qNLrZHuMwdca9KMt2bywc6X8AToNZXIapXvow3wj/1w9wtxeLyuaR
7HFFVxBtVHZ9pntMvr5GXUMLqvm8sxXyOQVFxCjXgBCkFku+9Hi9PdTlt5PIvQ5C
8ORynFVcdl8JPGYe510+lPSZVdgB/lrfDpyFwa1cnpVzXiefQFGSbNDYvh5DUnxv
5cDmXLS79HFJg+9tnkOeMqKiSPvJU9giPE/Thrq1RYBk+rvEJA8yfl/QdFQBiFp0
gOetxGoaJestpWNDh5qaCNdgyH3UwP1eR17WUFwR6f9wTaRwUlY8KkDbELjOn5IP
jD7QopZPCbhSiEcC+5aER6Cfcae1DtQnftG3A/PpNlVRYAdZY/Ls8rxFsac1tdeg
Q/0a6fpOG9WtsTXyzIvwk+b8ddJshXVslxLWj8Zw5F/PH27p4yRfZT0UscApO3Gf
xX/nh+4Rs8/BDu8jmUMpJmqR3RVO1WnyShNgB2ONGaDc17bcGNwSz7IKnN5MXOZ6
HCTNCtysIkl6uKAHq5TydZxz6LVwq+d62AVy1dKnVUqqLySOb7PLiWwZ06Qsvyfq
iKPeOnlFPUrRBvNdtTfXpRpb4gJ1OJBxsvuxsApr2+vh1be8PCA=
=Vmf5
-----END PGP SIGNATURE-----`,
            "message": "feat: update to rm.md\n",
            "parent": [
              "bba48a582aaa7e572c844cf7f42f3cd03eab81f0",
            ],
            "tree": "996a1c302a71aeeb3ba865c1a8720bbec39657b9",
          },
          "oid": "58aa7508ff84bc25552b4576b1b5ab0ddc5e41dd",
          "payload":
`tree 996a1c302a71aeeb3ba865c1a8720bbec39657b9
parent bba48a582aaa7e572c844cf7f42f3cd03eab81f0
author Riceball LEE <snowyu.lee@gmail.com> 1593509879 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593509879 +0800

feat: update to rm.md\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509597,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509597,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77Bt0ACgkQEPFehIUs
uGjwEhAAt+YBPtElFAv+hs5ybANPDKncpDdzYwJ+55aVG/RiWtN51BLj19pGm7Wg
lxw2NUPPaFkeMvsula7sS8kgDeuEnpapkoBAnPDUUon5KtLR77qn6JGAvdl6EGDN
x1Vyb3eOTjM0bW34gNTaAS6cHGhjmFFvX+w1Q1i0/kXBzn+/Gzy9IJTxYpoPYm0R
IIZ+FI34hb7/UV6UjEqT9JqbRq8NQMr4nV5IQeEFBkBW3k9lPkoJvKAk585nGcaG
NrqFCYI+S1RGChW1JO9dK9iNagvcEp5q1qs3R0Qag5ddf4502gQrHwIrvJBhiRXf
kg5SBYae+C+UedUEAMI7kEDvzJY2n3s/l2T69HcrCL/0Uzay9hHF7+uQUoXMz+og
u8kPJSMxEa5Ay2qThFL425d0bv7fm99kv8tVZrgDGAORF7F6cEj+0zAXrG66q7+C
3zby8ZOtBo5m9lEXhKWfkg3qjHBWSIEzFSf2sIsHZwMwaP/UX4bHc2+gsU4ZuSV9
ERuEM5rIcbUywNtVDCvRgyABNf+R9u1+OlbEE2gHkso1DiWzVhJl8OgoohNeQ6ve
usuE81K6Hl0RXFPZEGiP9+VvBKegZr+TpChj/U9Xxg5Xo8h1IJofq+pcM7szyiW+
XjQ2JObzauS9s+vlQZ3k01acgUxXF+izIb3JLWgZPo8ZQW57evA=
=8Fqf
-----END PGP SIGNATURE-----`,
            "message": "feat: add content to rm.md\n",
            "parent": [
              "8651dcc28c58d96439e99aa2bf239bf2ab238b73",
            ],
            "tree": "c8a2583e243cfdd458a6ff40ff6f7a2d57fbaa96",
          },
          "oid": "533131624898bb8ff588b48c77b26d63e7eb180f",
          "payload":
`tree c8a2583e243cfdd458a6ff40ff6f7a2d57fbaa96
parent 8651dcc28c58d96439e99aa2bf239bf2ab238b73
author Riceball LEE <snowyu.lee@gmail.com> 1593509597 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593509597 +0800

feat: add content to rm.md\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509547,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593509547,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77BqsACgkQEPFehIUs
uGj/oRAAmOMhskEjKwcFaEnC7InU/UMd4PHAy3XlKwqUCiQVEJWWi6B81n5IYsWi
mDOKXGYenlYOAf0HFqs7nPBeINDRFQp03d01wZT7JgacpERCvvu53IHLH8ndJehL
MQaRtWV/SpScj4OZH4Wzm6tjB4IBB/agZWM67tU4KKI2i6TOhQw8ktBoXbXGWO9g
OwjHW4mZn5eggIhyNzNKWRwzImopYlcBGqtYil5l4LWXADBfxAYfBCA296HkiD1N
sFzsi5mak7bKyW5/dFI9uP27BQSLLbGdbJIJlkYXi8XIo/sLPJGA0BHuiNLAVXUn
E/CO4hBH/tZtJNk3jg0TPLey4Lh34d3Tw8+6z6CvMKQtZ9JUXy8rAWMvAXg0+YVp
IvT+xA6HxECuBZ6UAYLU1ZHAvQtZch6XhJTirOJ5SMklTNKSiGaCLfDP/iuRWOYo
4x52uwkInIuintkcIZocjwEQ5DsG6jO4ylbwmEaWgpzEuR7xOuIBx38dsCoSDD+D
kyZF7ijammlt5Wc6A2u7ewEgCEy/GMEMJ+hUXqhJJ9Gi2uYU/WmC9GJDqD12JsEa
m6FFvEd+zCH/9K+O5eBUS9WFpiwXPP+amaXGBWkXnlbEYf/j9QemZXi/dkn1qCE7
yM9yzr8Tb0dJWqvovK42AlCuYsZ9BYOBM3zz+pGhpSdES9OYO08=
=/hmk
-----END PGP SIGNATURE-----`,
            "message": "first commit\n",
            "parent": [],
            "tree": "5640888e247e986136d36b1d52a9881abc7170f6",
          },
          "oid": "8651dcc28c58d96439e99aa2bf239bf2ab238b73",
          "payload":
`tree 5640888e247e986136d36b1d52a9881abc7170f6
author Riceball LEE <snowyu.lee@gmail.com> 1593509547 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593509547 +0800

first commit\n`,
        },
      ]
    )
  })

  it('a rename file with follow', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFileFsFixtureData as FsFixtureData)

    // act
    const commits = await log({
      fs,
      dir,
      ref: 'HEAD',
      filepath: 'a/rename1.md',
      follow: true,
    })

    // assert
    expect(commits.length).toBe(4)
    expect(commits).toEqual(
      [
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510674,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510674,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77CxIACgkQEPFehIUs
uGhgYg//c7Add1QPUgdVP11OSH9MGAyxjLes14+g6lyf+5raDa4bvQAgRVydiqbt
yI9SKwDni7HkZUK9CrqDtGwivvDjNK7n0R+ebNXRa4LYPrm9v9Htd6AqFNpSU6LG
Fvi/AQarINtnSt7prKAExgf4Dt9Q9tZrVLqNIxi/6AMq3yQHwcDb6hKubaAkXWdw
fkjmkUKtSSzycUy2HdrDSWX04frjN9ostqZHWQRvEztI1DdStwMIGMWibDioJoi+
xlT1I28NvRtF0hgGgjFUQoa5xN7WwVYpx2byXQdfFavhZxqfQjnR0MMyIouIBxGQ
aQGQNNEAgzVCMcnbTynLyZuG31daIS55AuoHS73RlTn+cJey32oblvnWRje9x7Vo
J52QpRJPu4CTWQM75vc43n9acZYxATNCr/tEW8SIb4PVR5q0lfh6M1+MyfHxNJrp
iRLkZaOlSsXxdU+oV5rcFg7YlpDIaqHBWTHjffqSUvBQ26S0Wot5W/kNkua35qcl
S4fomYCphl/zAxyp+O31MQYCS36MObIM3FXEGdfm1c6XWtrAhtMPTKtsk5YB2ltP
7MmLM1OwKltT6b55+RUnmQ4GyN92xIop9JMgDNDQfln/TRW73DaDFZt7OyZOZxQm
qkdT/ALm0qLz8iPf4q0zBbSd0e4RnYxD0FwfPQ7aVMAA77hzMoA=
=1cFE
-----END PGP SIGNATURE-----`,
            "message": "update rename1\n",
            "parent": [
              "cc9bcf734480b44d2e884ae75a11805e42c938d8",
            ],
            "tree": "7ab59df3bfd122ef5d24c70f9c8977f03b35e720",
          },
          "oid": "1bc226bc219beea3fb177de96350d8ad2f4c57cd",
          "payload":
`tree 7ab59df3bfd122ef5d24c70f9c8977f03b35e720
parent cc9bcf734480b44d2e884ae75a11805e42c938d8
author Riceball LEE <snowyu.lee@gmail.com> 1593510674 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593510674 +0800

update rename1\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510498,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510498,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77CmIACgkQEPFehIUs
uGi8fQ//VBw8UB5s5UvklkBbhhF/D6UsaH8ry1GU5fQoUZlf7ouBiKkdLv0Sqe7P
dTsohbo1FGHK/+shXddsL9fsp9yQgySt0Zck7HcG2hM8TyeHycsHIZf2jdkfqWob
3mjl2YoQLnht5z5+PoN7mHm6a4cNqFpKnQsHXuIMKjZLnvGDkgUOlxCiNrFsMmAx
sho1ROVR+TCkSi8KrR66CvA6a8sIRVib7Y93WX7QgpFQgw24ZbpZvlDR0TjullLi
df+9TBOEg89oZFtPBvpdURFSKltl6PMS7WnAoXgIFRAnwM5PnPZHkA37GanmSrj8
awLBkCapWuTF4/K+Bhu5hfURRac6IPJi56ygQWKpThAwk3h2L/saKTJFqD9vb/Go
+FM/fmex3lOGbVbZs1EtvkKwYIAb9pWKIcsnpzH6L6PrQE7DsLX2NP23hwMsXRt6
9vQDUuY8Dd45ttM8XPcVP0bM5C4PqmCErxXVFLcuLUtkF98RaUNnEdkDCo0yfojF
eQqn74zmQ0c3Q4WufxKM+4kQ1EflScv4uxOuBraj3hFcyac4u1CyLD0sv7InkdRB
T0iS+pLIyaJQIHV4AximpRISitVGuYnNtSuTrJJDmjmGGSMyC/jCsDrr1t0lMxdb
vdDuh3t+Ch9rvXHEPtnIokOW9U+hrVIeIGeiD0KM5QHD2CjcgwQ=
=2hns
-----END PGP SIGNATURE-----`,
            "message": "rename it\n",
            "parent": [
              "b9a8e7ed4e394942ba0a45f19563e8ad90b94ea9",
            ],
            "tree": "641ca0a41cfbccf4fb5c366840270fd25ec48b4f",
          },
          "oid": "cc9bcf734480b44d2e884ae75a11805e42c938d8",
          "payload":
`tree 641ca0a41cfbccf4fb5c366840270fd25ec48b4f
parent b9a8e7ed4e394942ba0a45f19563e8ad90b94ea9
author Riceball LEE <snowyu.lee@gmail.com> 1593510498 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593510498 +0800

rename it\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510465,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510465,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77CkEACgkQEPFehIUs
uGiGZA//Y5XlL5XeP05m7Jp2h2GBOc1nF6W7AAxRUSintdiX706aaoSAbVD3PwB3
zMuGiBIePPvQk+Oo+U8E0h2cD0bIY13BHJ+z23Qmn/1I1Vtup9uuWRCDR7T1Gy0r
3rUsdtyuZ3qIjliCP/j5254x6hspIUVBFUeHd/BWTWIimKIuYKRg8am9qNn2Dhir
o889/ZKuImsgF1eNsIaqlWN71n8KUGmDNcTdQ7eZzk4wUSsASyWRvnr3+OYkhjTp
ffJubsdA+FvixxCM8kg6UAoOFlMzJapVi/AdLXRQ6758tEpTPWdz2WVxrI3P1ACq
HzqvSIDoEISZDkKw/5maL9/89dV0qSuJcv3EqZQKxB3I7DAQgseHBAgThtChtdkh
a6OrCIkeJyNjQhgXpqtIJ71P6mVTDNnveDWO+9OilCrHfLa3nqYCz+xPZ2txRwG/
Z6+491WZVJAzU9rICT9AvrDpllacofr95LZCYdLd5J6qTYxq4m92AoZLOq5iKH1w
nCYyrfswZolEmbq50MhD7JdZKE3IPf5sfZfU+X4EfPYkr//P5M6wGzYVXYv6KttJ
jsekDsWczkATsKkp0xiC0lRVMNYwxl2Ly03JBZ/U2lBWEKhDgz1ELKa1XM9qEqSH
CbwmGwIWyAOFmjkBjWUHIqrm2zQFskpXu4a+03dqV5pCQlsf4qs=
=qvhP
-----END PGP SIGNATURE-----`,
            "message": "update rename\n",
            "parent": [
              "01cd249eaaceb8572bee5b24d8ed728c95f61bd6",
            ],
            "tree": "b76aafd52bf2d588756a32ebc9fa1ae0e68052c9",
          },
          "oid": "b9a8e7ed4e394942ba0a45f19563e8ad90b94ea9",
          "payload":
`tree b76aafd52bf2d588756a32ebc9fa1ae0e68052c9
parent 01cd249eaaceb8572bee5b24d8ed728c95f61bd6
author Riceball LEE <snowyu.lee@gmail.com> 1593510465 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593510465 +0800

update rename\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510416,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510416,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77ChAACgkQEPFehIUs
uGj/rxAAtVD1LSNM4gfyHQQB8G/E4JWmqoTlOJlC2s+zZRzMUgKPPqItt4p4FFMs
4GstDmVhGVKNpZjCkzZUX5N2Htm6PzWDdjtI5t+yl1rLfCR73VQKA/ztdUT2w1tg
jewPYRht9VrP46MqCxbnUpdt5zYhshGa3/Q9WRy11rakvjrbF9S9jKP+qiNyS1X2
3LGyDNQlS7XymSUFz4PSiOVTEpkSoOuGM6PnOhzmdNgl/JPY2vVCFcejO+qDq2K+
0EbLH6Ab0r7EiFQXufOSR0m6i3SXnfg66+ttiW5Olm2yfT0H05flvHUp93aeAoYf
qOvnSR5nX4jzQaLyHBvSWlotNfAgLSgLVZlUSoShYjRm/4UuFShZn546ykEZ1vTZ
rMU5PNvu8pqhCEneHnl7WEuxrlxt10vwtzWDUalaUZgNKXoIYDWISpVfzdOEuOu3
xNaH1GwZuGEtGZbDwOzsdTkJC5OTRzkb5c0SF/wlCUaW6rWW0J1cc/PX3bi4euwH
TdUe8v0KT2jX275FjpzvCQixduMrM9lm6vwOYSWplk6Au+v5ot2vaGob2ok5dMIP
Ai2oopT87heuC/iPcL2DKES1TItiXbRvYYu6jB3qCxD2cQUFxXgYyTuAnS3uSnhx
w89ElnO5qtr32gZ5+609hodFg8zrxZWxXxpNcIHfTgh17qHZuPg=
=iSgt
-----END PGP SIGNATURE-----`,
            "message": "add rename.md\n",
            "parent": [
              "2584400512051e6cb07fda5ff7e8dde556fc3124",
            ],
            "tree": "8ad18556d7692aef283e7cf30a287b6010c362a4",
          },
          "oid": "01cd249eaaceb8572bee5b24d8ed728c95f61bd6",
          "payload":
`tree 8ad18556d7692aef283e7cf30a287b6010c362a4
parent 2584400512051e6cb07fda5ff7e8dde556fc3124
author Riceball LEE <snowyu.lee@gmail.com> 1593510416 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593510416 +0800

add rename.md\n`,
        },
      ]
    )
  })

  it('a rename file forced without follow', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFileFsFixtureData as FsFixtureData)

    // act
    const commits = await log({
      fs,
      dir,
      ref: 'HEAD',
      filepath: 'a/rename1.md',
      force: true,
    })

    // assert
    expect(commits.length).toBe(2)
    expect(commits).toEqual(
      [
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510674,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510674,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77CxIACgkQEPFehIUs
uGhgYg//c7Add1QPUgdVP11OSH9MGAyxjLes14+g6lyf+5raDa4bvQAgRVydiqbt
yI9SKwDni7HkZUK9CrqDtGwivvDjNK7n0R+ebNXRa4LYPrm9v9Htd6AqFNpSU6LG
Fvi/AQarINtnSt7prKAExgf4Dt9Q9tZrVLqNIxi/6AMq3yQHwcDb6hKubaAkXWdw
fkjmkUKtSSzycUy2HdrDSWX04frjN9ostqZHWQRvEztI1DdStwMIGMWibDioJoi+
xlT1I28NvRtF0hgGgjFUQoa5xN7WwVYpx2byXQdfFavhZxqfQjnR0MMyIouIBxGQ
aQGQNNEAgzVCMcnbTynLyZuG31daIS55AuoHS73RlTn+cJey32oblvnWRje9x7Vo
J52QpRJPu4CTWQM75vc43n9acZYxATNCr/tEW8SIb4PVR5q0lfh6M1+MyfHxNJrp
iRLkZaOlSsXxdU+oV5rcFg7YlpDIaqHBWTHjffqSUvBQ26S0Wot5W/kNkua35qcl
S4fomYCphl/zAxyp+O31MQYCS36MObIM3FXEGdfm1c6XWtrAhtMPTKtsk5YB2ltP
7MmLM1OwKltT6b55+RUnmQ4GyN92xIop9JMgDNDQfln/TRW73DaDFZt7OyZOZxQm
qkdT/ALm0qLz8iPf4q0zBbSd0e4RnYxD0FwfPQ7aVMAA77hzMoA=
=1cFE
-----END PGP SIGNATURE-----`,
            "message": "update rename1\n",
            "parent": [
              "cc9bcf734480b44d2e884ae75a11805e42c938d8",
            ],
            "tree": "7ab59df3bfd122ef5d24c70f9c8977f03b35e720",
          },
          "oid": "1bc226bc219beea3fb177de96350d8ad2f4c57cd",
          "payload":
`tree 7ab59df3bfd122ef5d24c70f9c8977f03b35e720
parent cc9bcf734480b44d2e884ae75a11805e42c938d8
author Riceball LEE <snowyu.lee@gmail.com> 1593510674 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593510674 +0800

update rename1\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510498,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1593510498,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl77CmIACgkQEPFehIUs
uGi8fQ//VBw8UB5s5UvklkBbhhF/D6UsaH8ry1GU5fQoUZlf7ouBiKkdLv0Sqe7P
dTsohbo1FGHK/+shXddsL9fsp9yQgySt0Zck7HcG2hM8TyeHycsHIZf2jdkfqWob
3mjl2YoQLnht5z5+PoN7mHm6a4cNqFpKnQsHXuIMKjZLnvGDkgUOlxCiNrFsMmAx
sho1ROVR+TCkSi8KrR66CvA6a8sIRVib7Y93WX7QgpFQgw24ZbpZvlDR0TjullLi
df+9TBOEg89oZFtPBvpdURFSKltl6PMS7WnAoXgIFRAnwM5PnPZHkA37GanmSrj8
awLBkCapWuTF4/K+Bhu5hfURRac6IPJi56ygQWKpThAwk3h2L/saKTJFqD9vb/Go
+FM/fmex3lOGbVbZs1EtvkKwYIAb9pWKIcsnpzH6L6PrQE7DsLX2NP23hwMsXRt6
9vQDUuY8Dd45ttM8XPcVP0bM5C4PqmCErxXVFLcuLUtkF98RaUNnEdkDCo0yfojF
eQqn74zmQ0c3Q4WufxKM+4kQ1EflScv4uxOuBraj3hFcyac4u1CyLD0sv7InkdRB
T0iS+pLIyaJQIHV4AximpRISitVGuYnNtSuTrJJDmjmGGSMyC/jCsDrr1t0lMxdb
vdDuh3t+Ch9rvXHEPtnIokOW9U+hrVIeIGeiD0KM5QHD2CjcgwQ=
=2hns
-----END PGP SIGNATURE-----`,
            "message": "rename it\n",
            "parent": [
              "b9a8e7ed4e394942ba0a45f19563e8ad90b94ea9",
            ],
            "tree": "641ca0a41cfbccf4fb5c366840270fd25ec48b4f",
          },
          "oid": "cc9bcf734480b44d2e884ae75a11805e42c938d8",
          "payload":
`tree 641ca0a41cfbccf4fb5c366840270fd25ec48b4f
parent b9a8e7ed4e394942ba0a45f19563e8ad90b94ea9
author Riceball LEE <snowyu.lee@gmail.com> 1593510498 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1593510498 +0800

rename it\n`,
        },
      ]
    )
  })

  it('a rename file with follow multi same content files', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFileFsFixtureData as FsFixtureData)

    // act
    const commits = await log({
      fs,
      dir,
      ref: 'HEAD',
      filepath: 'rename-2.md',
      follow: true,
    })

    // assert
    expect(commits.length).toBe(2)
    expect(commits).toEqual(
      [
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1594594854,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1594594854,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl8LliYACgkQEPFehIUs
uGgGvBAAy4yXnK1dpMDe0x4fzWcNo9r5Ong/UFPBN8Wda0OMivmg7RbhmF1ZJxwS
J+IuSSVyunnFGqJPE6kF+CdNlCVC/Ol7LJV2rYIi+R+EBVLjU+eW1i6lSRCzJlPt
rwyWsLzvNWWsA8S88ndHMvNcr9NliSepsdXsF0dbbjru5aHct9Crvz9blb9q8WrN
yc2HLtE7TliPCxfNBqz5I2aLYwfjcEQbdnMYXQfseJBI1md0qzupY5YKkYTA+Yuf
1yEcPEOsACNrSalCTGooMgfKBC051HBnUVebAfdqUeR6XHjl6fVHTRsMKETsBQeH
hIHuN+dKjdX1zvzXbq3IStXTvTLAnK5f5td866FRvkuuTki3BiWYq/AfpwchpKKt
S3HkZnPhQXvOBSyYwI6fz+leZvpJDp+HjGDiNbB+H6iO1rDc7tVTzGKVniRsXVKJ
/L/OkP0B5pt+ElSGrlQ38Mk5uN0xtnbGPGCA074Tgry/rC8G5E8x9a1ZbsO5lQ1g
WuDwTuyzPlb6fxrctGPBI7yD+dxx/xIRjXkMRUo3GwcQSzTALl+x63SxOl4AfvmQ
Hyh2/osfJh8YUd67QDSQOY0tagXodZhAT4YkfXhqehHOBQ1Sc4GZI5wT/7nn0NTy
CP5jdSuA/wAIac/vGIQ89C71keAlKMgeEVrDOh6PISUGp4q8wy8=
=dlF4
-----END PGP SIGNATURE-----`,
            "message": "rename rename2 to rename-2\n",
            "parent": [
              "c7a666607cd986eee187b3df2c4adef3b7e56c94",
            ],
            "tree": "2d8cf1942da4577aa3f205108c228e1a95b33940",
          },
          "oid": "18f202dfed5cb66a295dc57f1f4ba1b7f6b74f36",
          "payload":
`tree 2d8cf1942da4577aa3f205108c228e1a95b33940
parent c7a666607cd986eee187b3df2c4adef3b7e56c94
author Riceball LEE <snowyu.lee@gmail.com> 1594594854 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1594594854 +0800

rename rename2 to rename-2\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1594594440,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1594594440,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl8LlIgACgkQEPFehIUs
uGjWiA/+Oda2OuPc7X9TFgDvnAwIWMRFThUebrGe2NaVstvtAAHte3Y/9FYqU062
0IWLycCENb7EbSTlIb6Lew09KXibnB4E39WrIcWYJJx2zICETNW56yedkd+1UJKZ
XwCewsgxyOVA960awxyLa2au06aHDF8U6128lHPZDVYIVgdYzhrn+18j+TXc4anB
p1whk5vAq7nkdTS0yATbLvlbBgymKaDxsGM7RO1giFSVQxzULb0RyH1BfnvkV4Ox
QxkyMPIYuziZXBpYBZmZOdIq1E5zOVkyoQIELpXy8NrLZ4Wj+r2P9RujdlA6zitA
xaeihDikZNRQc1vPsb119psabrrgXY/dxW9+p60kSXsUGWhX5RBKuPodfmpRHJTD
XKe5lckrPTUkCwbVMGXUx2nj9jCcF5FEMDQKEd/dBFKX9QPY6JnjaimIY1E8ulAX
rwXN91oECmt5OvPI2icOYLCkPkbNMy8rW3hEu4QDj8bCfPBtgHhon9SIsWKE6Bh9
sRLGU9cJWFPXNlyV9nj3G2w5MXrzm2SqJrxH/reuDdkB1Y2kYMM5pSNmlS1+IGk8
mTkYjlsCT4WxHRyyMJUtGxvdTisyp2odP7BEcEjq97ZHKKgUDtTbsmD0tfo0k0eL
KBa7eI7ag4KMAJ4MWk3X70f2qAeoaSNXAsYDSI+kt/rFgFsYSH0=
=AaPG
-----END PGP SIGNATURE-----`,
            "message": "add rename2\n",
            "parent": [
              "9a4eb099547166c9cf28628a127cfc9e59fa4f29",
            ],
            "tree": "795c22aa0265ce8c2d1cd3d4bf2d62ac1605b5ca",
          },
          "oid": "f44bab8dd4229486c7f6acc448cfc158bcbe5cfd",
          "payload":
`tree 795c22aa0265ce8c2d1cd3d4bf2d62ac1605b5ca
parent 9a4eb099547166c9cf28628a127cfc9e59fa4f29
author Riceball LEE <snowyu.lee@gmail.com> 1594594440 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1594594440 +0800

add rename2\n`,
        },
      ]
    )
  })

  it('a rename file2 with follow multi same content files', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(logFileFsFixtureData as FsFixtureData)

    // act
    const commits = await log({
      fs,
      dir,
      ref: 'HEAD',
      filepath: 'rename22.md',
      follow: true,
    })

    // assert
    // expect(commits.length).toBe(2)
    expect(commits).toEqual(
      [
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1594594611,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1594594611,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl8LlTMACgkQEPFehIUs
uGhUxhAAl4RTZr0osT5fs+bT/X5Ru2PvWyB8MJhc7Qy3nGQmpowqqlmU5UD+BKRI
oQfzGmZ7hKNRegS51HcNsv/kPqEA7maAAFDTqCKUFbLdeMKTf0vPCx90+U5hUamd
n3sLVK9lSSkz0FF3nVD28Fmcrh6oxHY4XQ/KHVBD8PZyIJ2DB4rYpqYB1p7Mx1LO
1mlMfru1J5Nc6DF+n6tANn95opkgwDjtPJkThZTfWDHQGy6mAJXbp0TChef/Rx+G
BegdvrkkMjP/Gq/+2b5LHEZb0Anode5zAYdz2J/SeqD2OiRvvR7nG0wVZAe6z7ZD
StnVFtTa0zaAGhxps6teyWEK3dtBkmybxs/1PbEDZcyFN3LYmOSSpIpoyU4S2m19
0Q3keZnyP2d3qajlgg25uW8ejh31TomcbQZ6n0VXqxysPpLAj394iFNt1ZKRrkFZ
rBKWTwhYYhzBAb3qMPAiOpN6UnTVzeeGrc5mN3DSh3WAPUOQmwTxFp9gkpWr7mgN
a3OZnSGg+7/fNUW8XUFyPIhud2C3BCDrm77bZPlHTZpZT31dWUxm30mIIM+wn3rF
LUmPaXY6jbCbig0Y0wAL+K+8ELs/XC7RJC70IRtYuXKnP2H9dE483cssmFALOTjF
2AikacC0uRtiJdMAe/YcFNzfYxEUo20Amkk3iutUAN+/kTlMNrM=
=WpAk
-----END PGP SIGNATURE-----`,
            "message": "update rename22\n",
            "parent": [
              "c87ae5071b9e674a1cfa3d853e33993c162c5def",
            ],
            "tree": "6ae7cfe2d19e1ab121ec7c31fac66f33f1ef9957",
          },
          "oid": "c7a666607cd986eee187b3df2c4adef3b7e56c94",
          "payload":
`tree 6ae7cfe2d19e1ab121ec7c31fac66f33f1ef9957
parent c87ae5071b9e674a1cfa3d853e33993c162c5def
author Riceball LEE <snowyu.lee@gmail.com> 1594594611 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1594594611 +0800

update rename22\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1594594590,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1594594590,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl8LlR4ACgkQEPFehIUs
uGgjuhAAxg/R9VUR69KDvtfI4dYffv/Oj36FYsEeBPTY1Gdy3p4fgXDaQ0D4KE4+
XOPKj25EKlydR0iDu9Uc3WxsXmfON0p1YChMiO8+YZojEQVbSkfOECnznOuK8VfR
6V7nIVJr9apYCGUeU80ZN22Ax1KlpVC9mkN+7VejAGKgf374URUvGoKBXuEAEkve
Bq54EJdWhWX5wg2fN88NXLf0kHYchM2vyVC5L2cNpIq3UxZ5SK8KCQoxgr7fst2a
RymJz8sQpKJiprv+D1YYCjONX8bqtFroy0aK/3RMKZ0bDm5IQq749C6ptDjd3uSW
ojzGuWMA6W8BAuM5Dj+5rxIHH+DXv3h/Q0kFbNYfS9/dnmXR0jzQaAlf7VaGvMXT
1UfCrrvLnbqy1Sc17xaUav7QQ46Yl22VF1gN8DCfol1i8IP0z6QsOWY+53Ok3t4C
X73OgGXqijP9BBgLIS9CplefV+oQX7Tyjw/jT3YdHRThPetxbtFgknjTrZ/2UlVo
kkBdrNNEk8mGMYZC1VljCdHEEWGl/GJEqaqoN3OdkJFkCge4qFHPjo10x9n3Qv5K
Zp0JYtM/roKelfUJh75p2OZoSMCV+jT+PoVPh3mCstSNCSt+2OSwTzFqQphRbU44
a38BGcs3PtlZIQuHDprQC93YYdRYZ7DvDbWEgGNcmOY24/4+qUY=
=7Pky
-----END PGP SIGNATURE-----`,
            "message": "rename rename2-2 to rename22\n",
            "parent": [
              "b3886fec49477755dcc5591c8df04f66535c0d79",
            ],
            "tree": "b5d1f7500bb4d6dd31b70c19c2ddf89955a3e509",
          },
          "oid": "c87ae5071b9e674a1cfa3d853e33993c162c5def",
          "payload":
`tree b5d1f7500bb4d6dd31b70c19c2ddf89955a3e509
parent b3886fec49477755dcc5591c8df04f66535c0d79
author Riceball LEE <snowyu.lee@gmail.com> 1594594590 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1594594590 +0800

rename rename2-2 to rename22\n`,
        },
        {
          "commit": {
            "author": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1594594501,
              "timezoneOffset": -480,
            },
            "committer": {
              "email": "snowyu.lee@gmail.com",
              "name": "Riceball LEE",
              "timestamp": 1594594501,
              "timezoneOffset": -480,
            },
            "gpgsig":
`-----BEGIN PGP SIGNATURE-----

iQIzBAABCgAdFiEEdmCAADTKSYRxNh/nEPFehIUsuGgFAl8LlMUACgkQEPFehIUs
uGhLsBAAorySvEQFjCKL1kIi2fJyF4xWcnbzlO2xd6HWaSB6VQZZZwrGQIRFOoVX
ExiOzHrcmcXrdH2so3hlLS7XjlmI3oGSKDxryscfe/wJEvRMr9flXAVIvQdMrG7T
K/mNYKs5Pu/0oOQu+UMNZHWOjnABiW8VAhs16WwyNWndr9sE22F97cn1dmMESL/K
W5OcpSkH3JuEaZTYSwbyyO8SYeLacyyBmKvqT0NBzt7mcZa0P/qAKWRWcmV5mQn+
pWB2EB2m7bwG09xjlyMwwDnVlbYfv7s2xz8pBLh2n+ye1d4roghTiGbCGjIe+CAy
8/lrwpARQNiXig3aaLNs7n//EaIkds8MWxygJk7tKwJTMPWF3mzM6k06XJKlKD9r
2JjTIRpmF01TdjUou8CLTNsfky1f4zCWUb5CNMReyvZellBFUDfh148Q3WlxDDVK
/XuHWIpr1mlzbYhXBWARJ4DMnqNWP6bL9Eo5ne9tbGFzh2rlitfzJdkMNwJ2QBKW
rbIy7jSEcpKDYUshg3VcbUkAKxCD4i2VWwDfTxzxwMiD6rWvP6Ig7seqj8Tfy2LU
ppVZj8VIxSQ5FH4s1MDbgHRyHz3OV+WS4MMLpdE8hhf8ZXFqlD+5b28ILEVO3EL3
kA3hblT2W8wSVy4NLzxf+inLsQ7UcU/qAAskaEG1sryZqkEZojI=
=bJdJ
-----END PGP SIGNATURE-----`,
            "message": "add rename2-2\n",
            "parent": [
              "58ebbeb4ea12bf4b0bdedfdf89e3d8c8f456e094",
            ],
            "tree": "84230a4664bf41b53034b9cab3c823db721055eb",
          },
          "oid": "6f2d819bb115a70fa9d831717d32ce2bdec3b83b",
          "payload":
`tree 84230a4664bf41b53034b9cab3c823db721055eb
parent 58ebbeb4ea12bf4b0bdedfdf89e3d8c8f456e094
author Riceball LEE <snowyu.lee@gmail.com> 1594594501 +0800
committer Riceball LEE <snowyu.lee@gmail.com> 1594594501 +0800

add rename2-2\n`,
        },
      ]
    )
  })
})
