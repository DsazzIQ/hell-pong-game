import { GameObjects, Math, Scene, Types } from 'phaser';

import TextureKey from '../../../constants/TextureKey';
import Game from '../../../Game';

const TITLE_TOP_SHIFT = 0.35;
const TITLE_SCALE = 1.5;
export default class Title extends GameObjects.Image {
  constructor(scene: Scene) {
    const { centerX, centerY } = scene.game as Game;
    super(scene, centerX, 0, TextureKey.Background.Key, TextureKey.Background.Frames.Text.MainTitle);
    this.scene.add.existing(this);

    this.setOrigin(0.5).setScale(TITLE_SCALE);

    // Set the final position of the title
    scene.tweens.add({
      targets: this,
      y: centerY * TITLE_TOP_SHIFT,
      duration: 1000,
      ease: Math.Easing.Bounce.Out,
      delay: 200
    } as Types.Tweens.TweenBuilderConfig);
  }
}
