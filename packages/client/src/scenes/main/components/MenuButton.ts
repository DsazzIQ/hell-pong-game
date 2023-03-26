import Button from '../../../components/Button';
import HellPongGame from '../../../Game';

export default class MenuButton extends Button {
  constructor(
    scene: Phaser.Scene,
    y: number,
    frame: string,
    onClick: () => void
  ) {
    super(scene, 0, y, frame, onClick);
    const game = scene.game as HellPongGame;
    this.addAnimation(scene, {
      targets: this.sprite,
      x: game.centerX,
      duration: 500,
      ease: Phaser.Math.Easing.Linear,
      delay: 200
    });
  }
}
