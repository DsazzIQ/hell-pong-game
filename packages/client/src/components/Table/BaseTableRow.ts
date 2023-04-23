import { TableCell } from './TableCell';
import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { ISize } from '@hell-pong/shared/entities/component/Size';

abstract class BaseTableRow<T> extends Phaser.GameObjects.Container {
  protected readonly config: T;
  protected readonly rowHeight: number;
  protected readonly cells: TableCell[];

  protected constructor(scene: Phaser.Scene, position: IPosition, rowHeight, cells: TableCell[], config: T) {
    super(scene, position.x, position.y);
    this.config = config;
    this.rowHeight = rowHeight;
    this.cells = cells;
  }

  protected abstract addBackground(): void;

  protected render(): void {
    this.addBackground();
    this.cells.forEach((cell, index) => this.addCell(cell, index));
  }

  protected sumCellsWidth(index: number): number {
    const { length } = this.cells;
    if (index <= 0 || index > length) {
      return 0;
    }

    let totalWidth = 0;
    if (index === length) {
      totalWidth = this.cells[length - 1].cellWidth;
      index -= 1;
    }

    for (let i = 0; i <= index; i++) {
      totalWidth += this.cells[i].cellWidth;
    }

    return totalWidth;
  }

  protected addCell(cell: TableCell, index: number) {
    cell.setX(this.sumCellsWidth(index));
    this.add(cell);
  }

  protected get rowWidth(): number {
    return this.sumCellsWidth(this.cells.length);
  }

  public getSize(): ISize {
    return { width: this.rowWidth, height: this.rowHeight };
  }
}
export default BaseTableRow;
