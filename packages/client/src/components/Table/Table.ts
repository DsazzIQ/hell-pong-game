import Phaser from 'phaser';
import { TableRow } from './TableRow';
import { TableHeader } from './TableHeader';
import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { TableCell } from './TableCell';

interface TableConfig {
  rowHeight?: number;
  headerColor?: number;
  headerTextStyle?: Phaser.Types.GameObjects.Text.TextStyle;
}

const defaultConfig: TableConfig = {
  rowHeight: 28,
  headerColor: 0x000000,
  headerTextStyle: { color: '#fff' }
};

export class Table extends Phaser.GameObjects.Container {
  private readonly headerContainer: Phaser.GameObjects.Container;
  private readonly rowsContainer: Phaser.GameObjects.Container;
  public readonly headerCellsWidth: number[];

  private selectedRowId?: string;
  public readonly config: TableConfig;

  constructor(
    scene: Phaser.Scene,
    position: IPosition,
    headerCells: TableCell[],
    rows: TableRow[] = [],
    selectedRowId?: string,
    config?: TableConfig
  ) {
    super(scene, position.x, position.y);
    scene.add.existing(this);

    this.selectedRowId = selectedRowId;
    this.config = { ...defaultConfig, ...config };

    this.headerContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.add(this.headerContainer);

    this.headerCellsWidth = headerCells.map((cell) => cell.cellWidth);
    this.renderHeader(headerCells);

    this.rowsContainer = new Phaser.GameObjects.Container(scene, 0, this.config.rowHeight!);
    this.add(this.rowsContainer);
    this.renderRows(rows);
  }

  private renderHeader(headerCells: TableCell[]) {
    this.headerContainer.add(
      new TableHeader(this.scene, { x: 0, y: 0 }, headerCells, this.config.rowHeight!, {
        headerColor: this.config.headerColor!,
        textStyle: this.config.headerTextStyle!
      })
    );
  }

  private renderRows(rows: TableRow[]): void {
    // Sort the rows by priority in descending order
    rows.sort((a, b) => b.priority - a.priority);

    for (const row of rows) {
      this.rowsContainer.add(row);
    }
    this.updateRowSelection();
  }

  public rerenderRows(rows: TableRow[]): void {
    this.rowsContainer.removeAll(true);
    this.renderRows(rows);
  }

  public setSelectedRowId(id?: string) {
    this.selectedRowId = id;
  }

  private updateRowSelection(): void {
    if (this.selectedRowId === undefined) return;
    const selectedRow = this.rowsContainer.list.find(
      (row) => row instanceof TableRow && row.isEqual(this.selectedRowId!)
    ) as TableRow | undefined;
    if (selectedRow) {
      selectedRow.setSelected();
    }
  }
}

export default Table;
