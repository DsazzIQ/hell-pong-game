import { Game as BaseGame, Scene, Types } from 'phaser';
export default class Game extends BaseGame {
  public readonly centerX;
  public readonly centerY;

  constructor(config: Types.Core.GameConfig) {
    super(config);

    this.centerX = config.width * 0.5;
    this.centerY = config.height * 0.5;
  }

  startTransition(fromScene: Scene, sceneName: string, data?: unknown, duration = 500) {
    fromScene.cameras.main.fadeOut(duration, 0, 0, 0, (_, progress: number) => {
      const animationFinished = progress === 1;
      if (!animationFinished) return;

      fromScene.scene.transition({
        target: sceneName,
        duration: duration,
        moveAbove: true,
        data
      });
      fromScene.scene.stop();
    });
  }
}
