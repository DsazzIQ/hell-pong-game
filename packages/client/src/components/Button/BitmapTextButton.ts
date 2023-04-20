import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { GameObjects, Scene } from 'phaser';

import Button from './Button';
import BitmapFamily from '../../constants/BitmapFamily';
import BitmapSize from '../../constants/BitmapSize';

export default class BitmapTextButton extends Button {
  protected text: GameObjects.BitmapText;

  constructor(
    scene: Scene,
    position: IPosition,
    frame: string,
    textConfig: { text: string; fontSize: BitmapSize },
    scale = 1,
    onClick: () => void
  ) {
    super(scene, position, frame, onClick);

    this.text = this.scene.add
      .bitmapText(0, 0, BitmapFamily.Retro, textConfig.text, textConfig.fontSize)
      .setOrigin(0.5);
    this.add(this.text);

    this.setScale(scale);
  }

  public setTextOrigin(x?, y?) {
    this.text.setOrigin(x, y);
    return this;
  }
}
