import GlowFilterPipelinePlugin from 'phaser3-rex-plugins/plugins/glowfilter2pipeline-plugin';

import { BaseScene } from './BaseScene';

const GLOW_DISTANCE = 4;
export class SplashScene extends BaseScene {
  constructor() {
    super('Splash');
  }

  private logo: Phaser.GameObjects.Image;
  private glow: GlowFilterPipelinePlugin;

  create() {
    const { width, height } = this.scale;

    // Display the logo in the center of the screen
    this.logo = this.add
      .image(width * 0.5, height * 0.5, 'textures', 'background/logo')
      .setOrigin(0.5);
    this.glow = this.plugins.get(
      'rexGlowFilterPipeline'
    ) as GlowFilterPipelinePlugin;
    this.glow.add(this.logo, {
      glowColor: 0xff0000,
      distance: GLOW_DISTANCE
    });

    // After a delay, transition to the MainScene
    this.time.delayedCall(2500, () => {
      this.startTransition('Main');
    });
  }

  update() {
    // Update the glow pipeline's intensity for animation
    const effect = this.glow.get(this.logo)[0];
    if (effect) {
      effect.outerStrength =
        GLOW_DISTANCE + Math.sin(this.time.now * 0.002) * GLOW_DISTANCE;
    }
  }

  destroy() {
    this.glow.destroy();
  }
}
