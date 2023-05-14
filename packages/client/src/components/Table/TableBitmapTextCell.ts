import Phaser from 'phaser';
import { TableCell } from './TableCell';
import { IPosition } from '@hell-pong/shared/entities/component/Position';
import BitmapFamily from '../../constants/BitmapFamily';
import BitmapSize from '../../constants/BitmapSize';

class TableBitmapTextCell extends TableCell {
  private readonly text: string;
  private readonly fontFamily: BitmapFamily;
  private readonly fontSize: BitmapSize;
  private readonly content: Phaser.GameObjects.BitmapText;

  constructor(
    scene: Phaser.Scene,
    text: string,
    width: number,
    offset: IPosition = { x: 0, y: 0 },
    fontFamily?: BitmapFamily,
    fontSize?: BitmapSize
  ) {
    super(scene, width, offset);
    this.text = text;
    this.fontFamily = fontFamily || BitmapFamily.Retro;
    this.fontSize = fontSize || BitmapSize.Small;

    this.content = this.createContent();
    this.add(this.content);
  }

  protected createContent(): Phaser.GameObjects.BitmapText {
    return new Phaser.GameObjects.BitmapText(
      this.scene,
      this._offset.x,
      this._offset.y,
      this.fontFamily,
      this.text,
      this.fontSize
    ).setOrigin(0, -0.5);
  }
}
export default TableBitmapTextCell;
