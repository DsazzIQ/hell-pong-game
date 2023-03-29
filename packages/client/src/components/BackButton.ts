import TextureKey from '../constants/TextureKey';
import Button from './Button';

export default class BackButton extends Button {
  constructor(scene: Phaser.Scene, onClick: () => void) {
    super(scene, 0, 0, TextureKey.Gui.Frames.Button.Back, onClick);
    this.sprite.setScale(0.5);
    this.setMarginBySize();
  }

  private setMarginBySize(): this {
    this.x = this.width * 0.5;
    this.y = this.height * 0.5;
    return this;
  }
}
