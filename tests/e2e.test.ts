import { init, clone } from 'git-essentials'

import { integrationContext } from './helpers/integrationContext'


describe('e2e', () => {
  describe('init', () => {
    it('should init new repository', async () => {
      await integrationContext(async ({ fs, http, dir }) => {
        // act
        await init({ fs, dir, defaultBranch: 'main' })

        // assert
        const headFile = await fs.readFile(`${dir}/.git/HEAD`, { encoding: 'utf8' })
        expect(headFile).toContain('refs/heads/main')
      })
    })
  })

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
        const fileStat = await fs.lstat(`${dir}/Welcome note.md`)
        expect(fileStat.isFile()).toBe(true)
      })
    })
  })
})
