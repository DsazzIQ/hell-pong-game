import TextureKey from '../../../constants/TextureKey';
import Game from '../../../Game';

const BACKGROUND_LABEL = 'menu_bg_animation';
export default class Background {
  constructor(scene: Phaser.Scene) {
    const game = scene.game as Game;

    const background = scene.add.sprite(
      game.centerX,
      game.centerY,
      TextureKey.Background.Key,
      TextureKey.Background.Frames.Menu.First
    );

    scene.anims.create({
      key: BACKGROUND_LABEL,
      frames: scene.anims.generateFrameNames(TextureKey.Background.Key, TextureKey.Background.Frames.Menu.Config),
      repeat: -1,
      frameRate: 6
    });

    background.displayHeight = game.canvas.height as number;
    const scale = background.displayHeight / background.height;
    background.displayWidth = background.width * scale;

    background.setDepth(-1).setOrigin(0.5).play(BACKGROUND_LABEL);
  }
}