import Button from '../../../components/Button';
import FontKey from '../../../constants/FontKey';
import TextureKey from '../../../constants/TextureKey';
import Game from '../../../Game';

const BUTTON_SCALE = 2;
const FONT_SIZE = 15;
export default class MenuButton extends Button {
  private readonly container: Phaser.GameObjects.Container;
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void) {
    super(scene, 0, 0, TextureKey.Gui.Frames.Button.Main, onClick);

    this.container = scene.add.container(x, y);
    this.container.add(this.sprite.setScale(BUTTON_SCALE));

    this.container.add(scene.add.bitmapText(0, 0, FontKey.Retro, text, FONT_SIZE).setOrigin(0.5));

    this.addAnimation(scene, {
      targets: this.container,
      x: (scene.game as Game).centerX,
      duration: 500,
      ease: Phaser.Math.Easing.Linear
    });
  }
}
