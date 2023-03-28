export default class Game extends Phaser.Game {
  public readonly centerX;
  public readonly centerY;

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);

    this.centerX = config.width * 0.5;
    this.centerY = config.height * 0.5;
  }

  startTransition(fromScene: Phaser.Scene, sceneName: string, duration = 500) {
    fromScene.cameras.main.fadeOut(duration, 0, 0, 0, (_, progress: number) => {
      const animationFinished = progress === 1;
      if (!animationFinished) return;

      fromScene.scene.transition({
        target: sceneName,
        duration: duration,
        moveAbove: true
      });
      fromScene.scene.stop();
    });
  }
}
