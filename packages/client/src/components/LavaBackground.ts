import { GameObjects, Scene } from 'phaser';

import Depth from '../constants/Depth';
import TextureKey from '../constants/TextureKey';
export default class LavaBackground extends GameObjects.TileSprite {
  constructor(scene: Scene) {
    const { width, height } = scene.game.config;
    super(
      scene,
      0,
      0,
      (width as number) * 2,
      (height as number) * 2,
      TextureKey.Background.Key,
      TextureKey.Background.Frames.Main
    );
    this.setDepth(Depth.Backstage);
    this.scene.add.existing(this);
  }

  public move() {
    this.tilePositionY--;
  }
}
