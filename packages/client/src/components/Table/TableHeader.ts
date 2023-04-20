import Phaser from 'phaser';
import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { TableCell } from './TableCell';

// TableHeader.ts
interface TableHeaderConfig {
  headerColor: number;
  textStyle: Phaser.Types.GameObjects.Text.TextStyle;
}

const defaultConfig: TableHeaderConfig = {
  headerColor: 0x000000,
  textStyle: { color: '#fff' }
};
export class TableHeader extends Phaser.GameObjects.Container {
  private readonly config: TableHeaderConfig;
  private readonly headerHeight: number;
  private readonly headerCells: TableCell[];

  constructor(
    scene: Phaser.Scene,
    position: IPosition,
    headerCells: TableCell[],
    headerHeight: number,
    config?: TableHeaderConfig
  ) {
    super(scene, position.x, position.y);
    this.headerHeight = headerHeight;
    this.headerCells = headerCells;
    this.config = { ...defaultConfig, ...config };

    this.render();
  }

  private render(): void {
    this.addBackground();
    this.headerCells.forEach((cell, index) => this.addCell(cell, index));
  }

  private sumRowWidth = (index: number) => {
    const { length } = this.headerCells;
    if (index <= 0 || index > length) {
      return 0;
    }

    let totalWidth = 0;
    if (index === length) {
      totalWidth = this.headerCells[length - 1].cellWidth;
      index -= 1;
    }

    for (let i = 0; i <= index; i++) {
      totalWidth += this.headerCells[i].cellWidth;
    }

    return totalWidth;
  };

  private get headerWidth(): number {
    return this.sumRowWidth(this.headerCells.length);
  }

  private addCell(cell: TableCell, index: number) {
    cell.setX(this.sumRowWidth(index));
    this.add(cell);
  }

  private addBackground() {
    const bg = new Phaser.GameObjects.Graphics(this.scene);
    bg.fillStyle(this.config.headerColor, 1);
    bg.fillRect(0, 0, this.headerWidth, this.headerHeight);
    this.add(bg);
  }
}
