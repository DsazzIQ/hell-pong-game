import Game from '../../../Game';

export default class Title {
  constructor(scene: Phaser.Scene) {
    const game = scene.game as Game;
    const title = scene.add.image(game.centerX, 0, 'textures', 'text/main-title').setOrigin(0.5);

    title.setScale(1.5); // TODO need to scale title sprite a bit

    // Set the final position of the title
    const TITLE_TOP_SHIFT = 0.35;
    scene.tweens.add({
      targets: title,
      y: game.centerY * TITLE_TOP_SHIFT,
      duration: 1000,
      ease: Phaser.Math.Easing.Bounce.Out,
      delay: 200
    });
  }
}
