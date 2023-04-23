import Phaser from 'phaser';
import { TableCell } from './TableCell';
import Color, { colorToHex } from '@hell-pong/shared/constants/color';
import BaseTableRow from './BaseTableRow';

export interface TableRowConfig {
  evenRowColor: Color;
  oddRowColor: Color;
  selectedRowColor: Color;
  textStyle: Phaser.Types.GameObjects.Text.TextStyle;
}
const defaultConfig: TableRowConfig = {
  evenRowColor: Color.Gray500,
  oddRowColor: Color.Gray600,
  selectedRowColor: Color.Amber600,
  textStyle: { color: colorToHex(Color.White) }
};

export class TableRow extends BaseTableRow<TableRowConfig> {
  private readonly rowId: string;
  private readonly isEven: boolean;

  constructor(
    scene: Phaser.Scene,
    rowId: string,
    index: number,
    cells: TableCell[],
    rowHeight: number,
    config?: TableRowConfig
  ) {
    super(scene, { x: 0, y: index * rowHeight }, rowHeight, cells, { ...defaultConfig, ...config });

    this.rowId = rowId;
    this.isEven = index % 2 === 0;

    this.render();
  }

  public isEqual(id: string): boolean {
    return this.rowId === id;
  }

  protected addBackground() {
    const bgColor = this.isEven ? this.config.evenRowColor : this.config.oddRowColor;
    const bg = new Phaser.GameObjects.Graphics(this.scene);
    bg.fillStyle(bgColor, 1);
    bg.fillRect(0, 0, this.rowWidth, this.rowHeight);
    this.add(bg);
  }

  public setSelected(): void {
    const bg = this.list[0] as Phaser.GameObjects.Graphics;
    bg.clear();
    bg.fillStyle(this.config.selectedRowColor, 1);
    bg.fillRect(0, 0, this.rowWidth, this.rowHeight);
  }
}
