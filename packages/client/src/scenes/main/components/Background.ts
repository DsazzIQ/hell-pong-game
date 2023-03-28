import Game from '../../../Game';

const BACKGROUND_LABEL = 'menu_bg_animation';
export default class Background {
  constructor(scene: Phaser.Scene) {
    const game = scene.game as Game;

    const background = scene.add.sprite(game.centerX, game.centerY, 'textures', 'background/main/0000');

    // Create the animation and add it to the animation manager
    scene.anims.create({
      key: BACKGROUND_LABEL,
      frames: scene.anims.generateFrameNames('textures', {
        prefix: 'background/main/',
        zeroPad: 4,
        start: 0,
        end: 7
      }),
      repeat: -1,
      frameRate: 6
    });

    background.displayHeight = game.canvas.height as number;
    const scale = background.displayHeight / background.height;
    background.displayWidth = background.width * scale;

    background.setDepth(-1).setOrigin(0.5).play(BACKGROUND_LABEL);
  }
}
