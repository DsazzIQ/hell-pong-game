import Phaser from 'phaser';
import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { TableCell } from './TableCell';
import Color, { colorToHex } from '@hell-pong/shared/constants/color';
import BaseTableRow from './BaseTableRow';

// TableHeader.ts
interface TableHeaderConfig {
  headerColor: Color;
  textStyle: Phaser.Types.GameObjects.Text.TextStyle;
}

const defaultConfig: TableHeaderConfig = {
  headerColor: Color.Black,
  textStyle: { color: colorToHex(Color.White) }
};
export class TableHeader extends BaseTableRow<TableHeaderConfig> {
  constructor(
    scene: Phaser.Scene,
    position: IPosition,
    cells: TableCell[],
    rowHeight: number,
    config?: TableHeaderConfig
  ) {
    super(scene, position, rowHeight, cells, { ...defaultConfig, ...config });

    this.render();
  }

  protected addBackground() {
    const bg = new Phaser.GameObjects.Graphics(this.scene);
    bg.fillStyle(this.config.headerColor, 1);
    bg.fillRect(0, 0, this.rowWidth, this.rowHeight);
    this.add(bg);
  }
}
