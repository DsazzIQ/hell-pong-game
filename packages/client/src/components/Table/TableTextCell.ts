import Phaser from 'phaser';
import { TableCell } from './TableCell';
import FontFamily from '../../constants/FontFamily';
import FontSize from '../../constants/FontSize';
import { IPosition } from '@hell-pong/shared/entities/component/Position';

class TableTextCell extends TableCell {
  private readonly text: string;
  private readonly textStyle: Phaser.Types.GameObjects.Text.TextStyle;
  private readonly content: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    text: string,
    width: number,
    offset: IPosition = { x: 0, y: 0 },
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle
  ) {
    super(scene, width, offset);
    this.text = text;
    this.textStyle = textStyle || { fontFamily: FontFamily.Text, fontSize: FontSize.SmallText };
    this.content = this.createContent();
    this.add(this.content);
  }

  protected createContent(): Phaser.GameObjects.Text {
    return new Phaser.GameObjects.Text(this.scene, this._offset.x, this._offset.y, this.text, this.textStyle).setOrigin(
      0,
      -0.5
    );
  }
}
export default TableTextCell;
