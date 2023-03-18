// Define the base class that extends Phaser.Scene
export class BaseScene extends Phaser.Scene {
  protected centerX: number = 0;
  protected centerY: number = 0;
  protected scaleFactor: number = 0;

  init() {
    console.log('this.game.config.width', this.game.config.width);
    console.log('this.game.canvas.width', this.game.canvas.width);
    console.log('this.scale.width', this.scale.width);

    this.centerX = this.game.canvas.width * 0.5;
    this.centerY = this.game.canvas.height * 0.5;
    this.scaleFactor = this.scale.width / (this.game.config.width as number);
    this.scale.lockOrientation('landscape');

    this.scale.on('resize', this.handleResize, this);
  }

  // init2() {
  //   const { width, height } = this.scale.baseSize;
  //   this.SCENE_CONTAINER = new Phaser.GameObjects.Container(this, 0, 0);
  //   this.add.displayList.add(this.SCENE_CONTAINER);
  //   this.add.displayList.addCallback = (gameObj) => {
  //     this.SCENE_CONTAINER.add(gameObj);
  //   };
  //   this.events.on("create", () => {
  //     if (window.orientation == 90 || window.orientation == -90) {
  //       return;
  //     }
  //     this.SCENE_CONTAINER.setAngle(90);
  //     this.SCENE_CONTAINER.setX(height);
  //     this.scale.setGameSize(height, width);
  //   });
  //   window.addEventListener("orientationchange", () => {
  //     const { width, height } = this.scale.baseSize;
  //     if (window.orientation == 90 || window.orientation == -90) {
  //       this.SCENE_CONTAINER.setAngle(0);
  //       this.SCENE_CONTAINER.setX(0);
  //     } else {
  //       this.SCENE_CONTAINER.setAngle(90);
  //       this.SCENE_CONTAINER.setX(height);
  //     }
  //     this.scale.setGameSize(height, width);
  //   });
  // }

  private handleResize(gameSize: Phaser.Structs.Size) {
    // redraw the scene after resizing the game window
    if (this.scene.isActive() && this.scene.isVisible()) {
      this.cameras.resize(gameSize.width, gameSize.height);
      this.scene.restart();
    }
  }

  protected calculateScaledFontSize(fontSize: number): number {
    return Math.floor(fontSize * this.scaleFactor);
  }

  addClickAnimation(element: Phaser.GameObjects.GameObject, onClick: () => void, scaleFactor: number = 0.9) {
    element.setInteractive({ useHandCursor: true });
    element.on("pointerdown", () => {
      element.scene.tweens.add({
        targets: element,
        scaleX: scaleFactor,
        scaleY: scaleFactor,
        duration: 100,
        ease: "Power1",
        yoyo: true,
        onComplete: onClick,
      });
    });
  }

  startTransition(sceneName: string) {
    this.cameras.main.fadeOut(500, 0, 0, 0, (camera: any, progress: number) => {
      if (progress === 1) {
        this.scene.transition({
          target: sceneName,
          duration: 500,
          moveAbove: true,
        });
        this.scene.stop();
        this.scene.remove();
      }
    });
  }
}