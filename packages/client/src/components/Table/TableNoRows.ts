import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { ISize } from '@hell-pong/shared/entities/component/Size';
import Phaser from 'phaser';
import Color, { colorToHex } from '@hell-pong/shared/constants/color';
import FontFamily from '../../constants/FontFamily';
import FontSize from '../../constants/FontSize';

export interface TableNoRowsConfig {
  bgColor: Color;
  textStyle: Phaser.Types.GameObjects.Text.TextStyle;
}
const defaultConfig: TableNoRowsConfig = {
  bgColor: Color.Gray500,
  textStyle: { color: colorToHex(Color.White), fontFamily: FontFamily.Text, fontSize: FontSize.SmallText }
};
class TableNoRows extends Phaser.GameObjects.Container {
  private config: TableNoRowsConfig;

  constructor(scene: Phaser.Scene, position: IPosition, size: ISize, message: string, config?: TableNoRowsConfig) {
    super(scene, position.x, position.y);

    this.config = { ...defaultConfig, ...config };
    this.setSize(size.width, size.height);

    scene.add.existing(this);

    this.addBackground();
    this.addMessage(message);
  }

  private addMessage(message: string): void {
    const text = new Phaser.GameObjects.Text(this.scene, 0, 0, message, this.config.textStyle);
    text.setOrigin(0.5);
    text.setPosition(this.width * 0.5, this.height * 0.5);

    this.add(text);
  }

  private addBackground() {
    const bgColor = Color.Gray500;
    const bg = new Phaser.GameObjects.Graphics(this.scene);
    bg.fillStyle(bgColor, 1);
    bg.fillRect(0, 0, this.width, this.height);
    this.add(bg);
  }
}
export default TableNoRows;
