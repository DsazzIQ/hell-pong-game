import Depth from '../constants/Depth';

export default class LavaBackground {
  private readonly background: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    this.background = scene.add
      .tileSprite(0, 0, width * 2, height * 2, 'textures', 'background/background-1')
      .setDepth(Depth.Backstage);
  }

  public move() {
    this.background.tilePositionX++;
    this.background.tilePositionY--;
  }
}
