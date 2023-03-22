import { GAME_HEIGHT, GAME_WIDTH } from '@hell-pong/shared/constants';

export class BaseScene extends Phaser.Scene {
  protected centerX = 0;
  protected centerY = 0;
  protected scaleFactor = 0;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
  init<T>(data?: T) {
    this.centerX = GAME_WIDTH * 0.5;
    this.centerY = GAME_HEIGHT * 0.5;

    this.scaleFactor = this.scale.width / (this.game.config.width as number);
    this.scale.lockOrientation('landscape');

    // this.scale.on('resize', this.handleResize, this);
  }

  // private handleResize(gameSize: Phaser.Structs.Size) {
  //   // redraw the scene after resizing the game window
  //   if (this.scene.isActive() && this.scene.isVisible()) {
  //     this.cameras.resize(gameSize.width, gameSize.height);
  //     this.scene.restart();
  //   }
  // }

  addClickAnimation(
    element: Phaser.GameObjects.GameObject,
    onClick: () => void,
    scaleFactor = 0.9
  ) {
    element.setInteractive({ useHandCursor: true });
    element.on('pointerdown', () => {
      element.scene.tweens.add({
        targets: element,
        scaleX: scaleFactor,
        scaleY: scaleFactor,
        duration: 100,
        ease: 'Power1',
        yoyo: true,
        onComplete: onClick
      });
    });
  }

  startTransition(sceneName: string) {
    this.cameras.main.fadeOut(500, 0, 0, 0, (_, progress: number) => {
      if (progress === 1) {
        this.scene.transition({
          target: sceneName,
          duration: 500,
          moveAbove: true
        });
        this.scene.stop();
        this.scene.remove();
      }
    });
  }
}
