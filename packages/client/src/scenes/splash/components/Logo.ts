import { GameObjects, Scene, Types } from 'phaser';

import TextureKey from '../../../constants/TextureKey';
import Game from '../../../Game';
import TweenBuilderConfig = Types.Tweens.TweenBuilderConfig;

const GLOW_DISTANCE = 4;
const GLOW_COLOR = 0xff0000;

export default class Logo extends GameObjects.GameObject {
  private readonly sprite: GameObjects.Sprite;

  constructor(scene: Scene, onFinish: () => void) {
    super(scene, 'Logo');

    const { centerX, centerY } = scene.game as Game;
    this.sprite = scene.add.sprite(centerX, centerY, TextureKey.Background.Key, TextureKey.Background.Frames.Logo);
    this.sprite.setOrigin(0.5).setAlpha(0);

    this.addAnimation(onFinish);
  }

  private addAnimation(onFinish) {
    this.sprite.preFX.addGlow(GLOW_COLOR, GLOW_DISTANCE);

    const scene = this.sprite.scene;
    const fadeOut = () => {
      scene.time.delayedCall(1500, () => {
        scene.tweens.add({
          targets: this.sprite,
          alpha: 0,
          duration: 1000,
          ease: 'Linear',
          onComplete: onFinish
        } as TweenBuilderConfig);
      });
    };

    scene.tweens.add({
      targets: this.sprite,
      alpha: 1,
      duration: 1000,
      ease: 'Linear',
      onComplete: fadeOut
    } as TweenBuilderConfig);
  }
}
