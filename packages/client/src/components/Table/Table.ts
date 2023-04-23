import Phaser from 'phaser';
import { TableRow } from './TableRow';
import { TableHeader } from './TableHeader';
import { IPosition } from '@hell-pong/shared/entities/component/Position';
import { TableCell } from './TableCell';
import Color, { colorToHex } from '@hell-pong/shared/constants/color';
import PaginationButton from './PaginationButton';
import TableNoRows from './TableNoRows';

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

const MIN_START_PAGE = 1;
const MAX_FIRST_VISIBLE_PAGES = 15;
const BUTTON_SPACING = 30;
const START_PAGE_OFFSET = 2;

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

    if (rows.length === 0) {
      const tableHeader = this.headerContainer.list[0] as TableHeader;
      const noDataMessage = 'No active games yet';
      const noRowsComponent = new TableNoRows(this.scene, { x: 0, y: 0 }, tableHeader.getSize(), noDataMessage);
      this.rowsContainer.add(noRowsComponent);
    }

    for (const row of rows) {
      this.rowsContainer.add(row);
    }
    this.updateRowSelection();
  }

  public renderPaginationButtons(rowsCount: number, doAction: () => void): void {
    this.paginationContainer.removeAll(true);

    const totalPages = this.totalPages(rowsCount);
    if (totalPages <= MIN_START_PAGE) return;

    const { rowHeight, rowsPerPage } = this.config;
    const offset: IPosition = { x: 10, y: 4 };

    const createButton = (
      label: string,
      disabled: boolean,
      selected: boolean,
      callback?: () => void
    ): PaginationButton => {
      const button = new PaginationButton(this.scene, rowHeight!, label, disabled, selected, callback);
      this.paginationContainer.add(button);
      button.setPosition(offset.x, offset.y);
      offset.x += BUTTON_SPACING;
      return button;
    };

    const isFirstPage = 0 === this.currentPage;
    createButton('<', isFirstPage, false, () => this.goToPreviousPage(doAction));
    createButton('1', isFirstPage, isFirstPage, () => this.goToPage(0, totalPages, doAction));

    const createDotsButton = () => createButton('..', true, false);
    // Create "..." button for left side
    const pageRange = this.calculatePageRange(totalPages);
    if (pageRange.start > MIN_START_PAGE) createDotsButton();

    // Create page buttons
    for (let i = pageRange.start; i < pageRange.end; i++) {
      const isCurrentPage = i === this.currentPage;
      createButton(`${i + 1}`, isCurrentPage, isCurrentPage, () => this.goToPage(i, totalPages, doAction));
    }

    const lastPageIndex = totalPages - 1;

    // Create "..." button for right side
    if (pageRange.end < lastPageIndex) createDotsButton();

    const isLastPage = lastPageIndex === this.currentPage;
    // Create last page button
    createButton(`${totalPages}`, isLastPage, isLastPage, () => this.goToPage(lastPageIndex, totalPages, doAction));

    // Create goToNext ">" button
    createButton('>', isLastPage, false, () => this.goToNextPage(rowsCount, doAction));

    this.paginationContainer.setPosition(0, rowHeight! + rowHeight! * rowsPerPage!);
  }

  private calculatePageRange(totalPages: number): { start: number; end: number } {
    const lastPageIndex = totalPages - 1;
    const start = Math.max(MIN_START_PAGE, this.currentPage - MAX_FIRST_VISIBLE_PAGES + START_PAGE_OFFSET);
    const end = Math.min(lastPageIndex, start + MAX_FIRST_VISIBLE_PAGES - MIN_START_PAGE);
    return { start, end };
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
    const lastPageIndex = totalPages - 1;
    if (totalPages && this.currentPage > lastPageIndex) {
      this._currentPage = lastPageIndex;
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
