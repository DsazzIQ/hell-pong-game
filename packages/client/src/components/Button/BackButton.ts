import { Scene } from 'phaser';

import TextureKey from '../../constants/TextureKey';
import Button from './Button';

export default class BackButton extends Button {
  constructor(scene: Scene, onClick: () => void) {
    super(scene, { x: 0, y: 0 }, TextureKey.Gui.Frames.Button.Back, onClick);
    this.sprite.setScale(1.25);
    this.setMarginBySize();
  }

  private setMarginBySize(): this {
    this.x = this.sprite.width;
    this.y = this.sprite.height;
    return this;
  }
}
