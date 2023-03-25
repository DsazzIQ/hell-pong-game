import Phaser from 'phaser';
import GlowFilterPipelinePlugin from 'phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin';

import { BaseScene } from './BaseScene';

const GLOW_DISTANCE = 4;
export default class SplashScene extends BaseScene {
  constructor() {
    super('Splash');
  }

  private logo: Phaser.GameObjects.Image;
  private glow: GlowFilterPipelinePlugin;

  create() {
    const { width, height } = this.scale;
    this.sound.unlock();
    this.sound.play('splash');

    // Display the logo in the center of the screen
    this.logo = this.add
      .image(width * 0.5, height * 0.5, 'textures', 'background/logo')
      .setOrigin(0.5)
      .setAlpha(0);

    this.glow = this.plugins.get(
      'rexGlowFilterPipeline'
    ) as GlowFilterPipelinePlugin;

    this.glow.add(this.logo, {
      glowColor: 0xff0000,
      distance: GLOW_DISTANCE
    });

    const onFinish = () => {
      this.startTransition('Main');
      this.sound.get('splash').stop();
    };

    const fadeOut = () => {
      this.tweens.add({
        targets: this.logo,
        alpha: 0,
        duration: 1000, // Duration in milliseconds, adjust as needed
        ease: 'Linear',
        onComplete: onFinish
      });
    };

    this.tweens.add({
      targets: this.logo,
      alpha: 1,
      duration: 1000, // Duration in milliseconds, adjust as needed
      ease: 'Linear',
      onComplete: fadeOut
    });
  }

  update() {
    // Update the glow pipeline's intensity for animation
    const effect = this.glow.get(this.logo)[0];
    if (effect) {
      effect.outerStrength =
        GLOW_DISTANCE + Math.sin(this.time.now * 0.0015) * GLOW_DISTANCE;
    }
  }

  destroy() {
    this.glow.destroy();
  }
}
