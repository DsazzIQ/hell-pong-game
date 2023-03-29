import Depth from '../constants/Depth';
import TextureKey from '../constants/TextureKey';
export default class LavaBackground {
  private readonly background: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene) {
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
