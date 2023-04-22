import Phaser from 'phaser';
import { TableRow } from './TableRow';
import { TableHeader } from './TableHeader';
import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { TableCell } from './TableCell';
import Color, { colorToHex } from '@hell-pong/shared/constants/color';
import PaginationButton from './PaginationButton';

interface TableConfig {
  rowsPerPage?: number;
  rowHeight?: number;
  headerColor?: number;
  headerTextStyle?: Phaser.Types.GameObjects.Text.TextStyle;
}

const defaultConfig: TableConfig = {
  rowsPerPage: 12,
  rowHeight: 28,
  headerColor: Color.Black,
  headerTextStyle: { color: colorToHex(Color.White) }
};

export class Table extends Phaser.GameObjects.Container {
  private readonly headerContainer: Phaser.GameObjects.Container;
  private readonly rowsContainer: Phaser.GameObjects.Container;
  private readonly paginationContainer: Phaser.GameObjects.Container;

  protected selectedRowId?: string;
  protected _currentPage: number;

  public readonly headerCellsWidth: number[];
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
    this._currentPage = 0;

    this.config = { ...defaultConfig, ...config };

    this.headerContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.add(this.headerContainer);

    this.headerCellsWidth = headerCells.map((cell) => cell.cellWidth);
    this.renderHeader(headerCells);

    this.rowsContainer = new Phaser.GameObjects.Container(scene, 0, this.config.rowHeight!);
    this.add(this.rowsContainer);
    this.renderRows(rows);

    this.paginationContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    this.add(this.paginationContainer);
  }

  private renderHeader(headerCells: TableCell[]) {
    this.headerContainer.add(
      new TableHeader(this.scene, { x: 0, y: 0 }, headerCells, this.config.rowHeight!, {
        headerColor: this.config.headerColor!,
        textStyle: this.config.headerTextStyle!
      })
    );
  }

  public renderRows(rows: TableRow[]): void {
    this.rowsContainer.removeAll(true);
    for (const row of rows) {
      this.rowsContainer.add(row);
    }
    this.updateRowSelection();
  }

  public renderPaginationButtons(rowsCount: number, doAction: () => void): void {
    this.paginationContainer.removeAll(true);

    const totalPages = this.totalPages(rowsCount);
    if (totalPages <= 1) return;

    const { rowHeight, rowsPerPage } = this.config;
    const offset: IPosition = { x: 10, y: 4 };

    for (let i = 0; i < totalPages; i++) {
      const button = new PaginationButton(this.scene, rowHeight!, i, i === this.currentPage, () => {
        this.goToPage(i, totalPages, doAction);
      });
      const buttonPosition = this.getPaginationButtonPosition(offset, i);
      button.setPosition(buttonPosition.x, buttonPosition.y);
      this.paginationContainer.add(button);
    }

    this.paginationContainer.setPosition(offset.x, rowHeight! + rowHeight! * rowsPerPage!);
  }

  private getPaginationButtonPosition(offset: IPosition, index: number): IPosition {
    return {
      x: offset.x + index * 30,
      y: offset.y
    };
  }

  public get startIndex(): number {
    return this._currentPage * this.config.rowsPerPage!;
  }

  public get endIndex(): number {
    return this.startIndex + this.config.rowsPerPage!;
  }

  public totalPages(rowsCount: number): number {
    return Math.ceil(rowsCount / this.config.rowsPerPage!);
  }

  public get currentPage(): number {
    return this._currentPage;
  }

  public correctCurrentPage(rowsCount: number): number {
    const totalPages = this.totalPages(rowsCount);
    if (totalPages && this.currentPage > totalPages - 1) {
      this._currentPage = totalPages - 1;
    }
    return this._currentPage;
  }

  goToNextPage(rowsCount: number, doAction: () => void) {
    if (this._currentPage < this.totalPages(rowsCount) - 1) {
      this._currentPage++;
      doAction();
    }
  }

  goToPage(page: number, totalPages: number, doAction: () => void) {
    let currentPage = page;
    if (page <= 0 || page >= totalPages) currentPage = 0;
    if (this._currentPage !== currentPage) {
      this._currentPage = currentPage;
      doAction();
    }
  }

  goToPreviousPage(doAction: () => void) {
    if (this._currentPage > 0) {
      this._currentPage--;
      doAction();
    }
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
