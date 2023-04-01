import { IPosition } from '@hell-pong/shared/entities/component/Position';

import FontFamily from '../constants/FontFamily';
import FontSize from '../constants/FontSize';
import Button from './Button';

export default class BitmapTextButton extends Button {
  protected text: Phaser.GameObjects.BitmapText;

  constructor(
    scene: Phaser.Scene,
    position: IPosition,
    frame: string,
    textConfig: { text: string; fontSize: FontSize },
    scale = 1,
    onClick: () => void
  ) {
    super(scene, position, frame, onClick);

    this.text = scene.add.bitmapText(0, 0, FontFamily.Retro, textConfig.text, textConfig.fontSize).setOrigin(0.5);
    this.container.add(this.text);

    this.container.setScale(scale);
  }

  public setTextOrigin(x?, y?) {
    this.text.setOrigin(x, y);
    return this;
  }
}
