import { Scene } from 'phaser';

import Button from './Button';
import Color from '@hell-pong/shared/constants/color';

export default class SmallButton extends Button {
  constructor(scene: Scene, frame: string, onClick: () => void, onHoverColor = Color.Red) {
    super(scene, { x: 0, y: 0 }, frame, onClick, onHoverColor);
    // this.sprite.setScale(1.25);
    this.setMarginBySize();
  }

  private setMarginBySize(): this {
    this.x = this.sprite.width;
    this.y = this.sprite.height;
    return this;
  }
}
