import {describe, expect, test} from '@jest/globals'

import { init } from '../src/api/init'
import { makeFixture } from './helpers/makeFixture';

describe('init', () => {
  test('should not fail', async () => {
    // arrange
    const { dir, fs } = await makeFixture('test_init')

    // act
    await init({ dir, fs })
  });
});
