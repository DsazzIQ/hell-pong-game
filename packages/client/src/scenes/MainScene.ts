import Phaser from 'phaser';

import AudioKey from '../constants/AudioKey';
import HellPongGame from '../Game';

class MainScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Sprite;

  constructor() {
    super('Main');
  }

  create() {
    this.initBackground();
    this.initTitle();
    this.initStartButton();
    this.playMainTheme();
  }

  playMainTheme() {
    this.sound.play(AudioKey.MainTheme, { loop: true, volume: 0.1 });
  }

  stopMainTheme() {
    this.sound.get(AudioKey.MainTheme).stop();
  }

  // Play the animation on the sprite
  // Set sprite height to screen height
  // background.displayHeight = this.game.canvas.height as number;
  // const scale = background.displayHeight / background.height;
  // background.displayWidth = background.width * scale;
  initBackground() {
    // Get a reference to the scene's animation manager
    const anims = this.anims;
    const background = this.add.sprite(
      (this.game as HellPongGame).centerX,
      (this.game as HellPongGame).centerY,
      'textures',
      'background/main/0000'
    );
    // Create the animation and add it to the animation manager
    anims.create({
      key: 'menu_bg_animation',
      frames: anims.generateFrameNames('textures', {
        prefix: 'background/main/',
        zeroPad: 4,
        start: 0,
        end: 7
      }),
      repeat: -1,
      frameRate: 6
    });

    background.displayHeight = this.game.canvas.height as number;
    const scale = background.displayHeight / background.height;
    background.displayWidth = background.width * scale;

    background.setDepth(-1).setOrigin(0.5).play('menu_bg_animation');
  }

  initTitle() {
    const title = this.add
      .image(
        (this.game as HellPongGame).centerX,
        0,
        'textures',
        'text/main-title'
      )
      .setOrigin(0.5);
    title.setScale(1.5);

    // Set the final position of the title
    this.tweens.add({
      targets: title,
      y: (this.game as HellPongGame).centerY * 0.35,
      duration: 1000,
      ease: Phaser.Math.Easing.Bounce.Out,
      delay: 200
    });
  }

  initStartButton() {
    this.startButton = this.add.sprite(0, 0, 'textures', 'button/main-start');
    this.startButton.setY((this.game as HellPongGame).centerY);

    (this.game as HellPongGame).addClickAnimation(
      this.startButton,
      () => {
        this.stopMainTheme();
        (this.game as HellPongGame).startTransition(this, 'Lobby');
      },
      0.9
    );

    // Move the button to the center
    this.tweens.add({
      targets: this.startButton,
      x: (this.game as HellPongGame).centerX,
      duration: 500,
      ease: Phaser.Math.Easing.Linear,
      delay: 200
    });
  }
}

export default MainScene;
