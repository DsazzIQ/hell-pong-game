import { GameObjects, Math, Scene, Types } from 'phaser';

import TextureKey from '../../../constants/TextureKey';
import Game from '../../../Game';
import TweenBuilderConfig = Types.Tweens.TweenBuilderConfig;

const TITLE_TOP_SHIFT = 0.35;
const TITLE_SCALE = 1.5;
export default class Title extends GameObjects.GameObject {
  constructor(scene: Scene) {
    super(scene, 'MainTitle');

    const { centerX, centerY } = scene.game as Game;
    const title = scene.add
      .image(centerX, 0, TextureKey.Background.Key, TextureKey.Background.Frames.Text.MainTitle)
      .setOrigin(0.5)
      .setScale(TITLE_SCALE);

    // Set the final position of the title
    scene.tweens.add({
      targets: title,
      y: centerY * TITLE_TOP_SHIFT,
      duration: 1000,
      ease: Math.Easing.Bounce.Out,
      delay: 200
    } as TweenBuilderConfig);
  }
}
