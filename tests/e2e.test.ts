import path from 'path'

import { clone } from '../src'
import { integrationContext } from './helpers/integrationContext'


describe('e2e', () => {
  describe('clone', () => {
    it('should clone from GitHub', async () => {
      await integrationContext(async ({ fs, http, dir }) => {
        // arrange
        const url = 'https://github.com/NotesHubApp/Welcome.git'

        // act
        await clone({
          fs,
          http,
          dir,
          url,
          singleBranch: true,
          depth: 1
        })

        // assert
        const fileStat = await fs.lstat(path.join(dir, 'Welcome note.md'))
        expect(fileStat.isFile()).toBe(true)
      })
    })
  })
})
