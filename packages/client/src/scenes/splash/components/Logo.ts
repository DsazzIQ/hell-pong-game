import Phaser from 'phaser';

import Game from '../../../Game';

const GLOW_DISTANCE = 4;
const GLOW_COLOR = 0xff0000;

export default class Logo {
  private readonly sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, onFinish: () => void) {
    const game = scene.game as Game;
    this.sprite = scene.add.sprite(game.centerX, game.centerY, 'textures', 'background/logo');
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
        });
      });
    };

    scene.tweens.add({
      targets: this.sprite,
      alpha: 1,
      duration: 1000,
      ease: 'Linear',
      onComplete: fadeOut
    });
  }
}