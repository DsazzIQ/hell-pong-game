import Button from '../../../components/Button';
import Game from '../../../Game';

export default class MenuButton extends Button {
  constructor(scene: Phaser.Scene, y: number, frame: string, onClick: () => void) {
    super(scene, 0, y, frame, onClick);

    this.addAnimation(scene, {
      targets: this.sprite,
      x: (scene.game as Game).centerX,
      duration: 500,
      ease: Phaser.Math.Easing.Linear,
      delay: 200
    });
  }
}
