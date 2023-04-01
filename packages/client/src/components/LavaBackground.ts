import { GameObjects, Scene } from 'phaser';

import Depth from '../constants/Depth';
import TextureKey from '../constants/TextureKey';
export default class LavaBackground {
  private readonly background: GameObjects.TileSprite;

  constructor(scene: Scene) {
    const { width, height } = scene.game.config;
    this.background = scene.add
      .tileSprite(0, 0, width * 2, height * 2, TextureKey.Background.Key, TextureKey.Background.Frames.Main)
      .setDepth(Depth.Backstage);
  }

  public move() {
    this.background.tilePositionX++;
    this.background.tilePositionY--;
  }
}
