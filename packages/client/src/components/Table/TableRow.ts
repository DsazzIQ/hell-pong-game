import Phaser from 'phaser';
import { TableCell } from './TableCell';
import Color, { colorToHex } from '@hell-pong/shared/constants/color';

export interface TableRowConfig {
  evenRowColor: number;
  oddRowColor: number;
  selectedRowColor: number;
  textStyle: Phaser.Types.GameObjects.Text.TextStyle;
}
const defaultConfig: TableRowConfig = {
  evenRowColor: Color.Gray500,
  oddRowColor: Color.Gray600,
  selectedRowColor: Color.Amber600,
  textStyle: { color: colorToHex(Color.White) }
};

export enum RowPriority {
  PIN = 999,
  HIGH = 100,
  LOW = 0
}

export class TableRow extends Phaser.GameObjects.Container {
  private readonly rowId: string;
  private readonly rowCells: TableCell[];
  private readonly rowHeight: number;
  private readonly isEven: boolean;
  private readonly config: TableRowConfig;

  public priority: RowPriority;

  constructor(
    scene: Phaser.Scene,
    rowId: string,
    index: number,
    rowCells: TableCell[],
    rowHeight: number,
    config?: TableRowConfig
  ) {
    super(scene, 0, index * rowHeight);
    this.priority = RowPriority.HIGH;

    this.rowCells = rowCells;

    this.isEven = index % 2 === 0;
    this.rowId = rowId;
    this.rowHeight = rowHeight;
    this.config = { ...defaultConfig, ...config };

    this.render();
  }

  public setPriority(priority: RowPriority): this {
    this.priority = priority;
    return this;
  }

  public pin(): this {
    this.priority = RowPriority.PIN;
    return this;
  }

  public isEqual(id: string): boolean {
    return this.rowId === id;
  }

  private render(): void {
    this.addBackground();
    this.rowCells.forEach((cell, index) => this.addCell(cell, index));
  }

  private get rowWidth(): number {
    return this.sumRowWidth(this.rowCells.length);
  }

  private sumRowWidth = (index: number) => {
    const { length } = this.rowCells;
    if (index <= 0 || index > length) {
      return 0;
    }

    let totalWidth = 0;
    if (index === length) {
      totalWidth = this.rowCells[length - 1].cellWidth;
      index -= 1;
    }

    for (let i = 0; i <= index; i++) {
      totalWidth += this.rowCells[i].cellWidth;
    }

    return totalWidth;
  };

  private addCell(cell: TableCell, index: number) {
    cell.setX(this.sumRowWidth(index));
    this.add(cell);
  }

  private addBackground() {
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
