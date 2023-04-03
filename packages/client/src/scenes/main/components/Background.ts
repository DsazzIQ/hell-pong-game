import { GameObjects, Scene } from 'phaser';

import TextureKey from '../../../constants/TextureKey';
import Game from '../../../Game';

const BACKGROUND_LABEL = 'menu_bg_animation';
export default class Background extends GameObjects.Sprite {
  constructor(scene: Scene) {
    const { centerX, centerY, canvas } = scene.game as Game;
    super(scene, centerX, centerY, TextureKey.Background.Key, TextureKey.Background.Frames.Menu.First);

    scene.anims.create({
      key: BACKGROUND_LABEL,
      frames: scene.anims.generateFrameNames(TextureKey.Background.Key, TextureKey.Background.Frames.Menu.Config),
      repeat: -1,
      frameRate: 6
    });

    this.displayHeight = canvas.height as number;
    const scale = this.displayHeight / this.height;
    this.displayWidth = this.width * scale;

    this.setDepth(-1).setOrigin(0.5).play(BACKGROUND_LABEL);
    this.scene.add.existing(this);
  }
}
