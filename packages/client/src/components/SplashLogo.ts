import Phaser from 'phaser';

const GLOW_DISTANCE = 4;
const GLOW_COLOR = 0xff0000;

export default class SplashLogo {
  private readonly sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x, y, onFinish: () => void) {
    this.sprite = scene.add.sprite(x, y, 'textures', 'background/logo');

    this.sprite.setOrigin(0.5).setAlpha(0);
    this.sprite.preFX.addGlow(GLOW_COLOR, GLOW_DISTANCE);

    this.addAnimation(scene, onFinish);
  }

  private addAnimation(scene, onFinish) {
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

    // fade in
    scene.tweens.add({
      targets: this.sprite,
      alpha: 1,
      duration: 1000,
      ease: 'Linear',
      onComplete: fadeOut
    });
  }
}
