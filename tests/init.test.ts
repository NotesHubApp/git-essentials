import {describe, expect, test} from '@jest/globals'

import { init } from '../src/api/init'
import { makeFsClientFixture } from './helpers/makeFsClientFixture';

describe('init', () => {
  test('init', async () => {
    // arrange
    const { dir, fsClient, fs } = await makeFsClientFixture('test_init')

    // act
    await init({ dir, fs: fsClient })

    // assert
    expect(await fs.exists(dir)).toBe(true)
    expect(await fs.exists(`${dir}/.git/objects`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/refs/heads`)).toBe(true)
    expect(await fs.exists(`${dir}/.git/HEAD`)).toBe(true)
  });
});
