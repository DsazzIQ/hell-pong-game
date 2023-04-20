import { GameObjects, Scene, Types } from 'phaser';

import TextureKey from '../../../constants/TextureKey';
import Game from '../../../Game';
import Color from '@hell-pong/shared/constants/color';

const GLOW_DISTANCE = 4;
const GLOW_COLOR = Color.Red;

export default class Logo extends GameObjects.Sprite {
  constructor(scene: Scene, onFinish: () => void) {
    const { centerX, centerY } = scene.game as Game;
    super(scene, centerX, centerY, TextureKey.Background.Key, TextureKey.Background.Frames.Logo);

    this.setOrigin(0.5).setAlpha(0);
    this.addAnimation(onFinish);

    this.scene.add.existing(this);
  }

  private addAnimation(onFinish) {
    this.preFX?.addGlow(GLOW_COLOR, GLOW_DISTANCE);

    const scene = this.scene;
    const fadeOut = () => {
      scene.time.delayedCall(1500, () => {
        scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 1000,
          ease: 'Linear',
          onComplete: onFinish
        } as Types.Tweens.TweenBuilderConfig);
      });
    };

    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 1000,
      ease: 'Linear',
      onComplete: fadeOut
    } as Types.Tweens.TweenBuilderConfig);
  }
}
