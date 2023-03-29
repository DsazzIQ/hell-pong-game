import TextureKey from '../../../constants/TextureKey';
import Game from '../../../Game';

const TITLE_TOP_SHIFT = 0.35;
export default class Title {
  constructor(scene: Phaser.Scene) {
    const game = scene.game as Game;
    const title = scene.add
      .image(game.centerX, 0, TextureKey.Background.Key, TextureKey.Background.Frames.Text.MainTitle)
      .setOrigin(0.5)
      .setScale(1.5);

    // Set the final position of the title
    scene.tweens.add({
      targets: title,
      y: game.centerY * TITLE_TOP_SHIFT,
      duration: 1000,
      ease: Phaser.Math.Easing.Bounce.Out,
      delay: 200
    });
  }
}
