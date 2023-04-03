import { HEADLESS } from 'phaser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import GameConfig from '../Config';
import Game from '../Game';

const TetsGameConfig = GameConfig;
TetsGameConfig.type = HEADLESS;

let game: Game;
beforeEach(() => {
  game = new Game(GameConfig);
});

afterEach(() => {
  game.destroy(true);
});

// import { describe, expect, it } from 'vitest';
// import game from '../index';
describe('a new game', () => {
  it('should start', () => {
    expect(game.isRunning).toBe(false);
  });
});
