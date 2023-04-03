import { describe, expect, it } from 'vitest';

import game from '../index';

describe('a new game', () => {
  it('should start', () => {
    expect(game.isRunning).toBe(false);
  });
});
