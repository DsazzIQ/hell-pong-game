import Phaser from 'phaser';
import { TableCell } from './TableCell';
import Button from '../Button/Button';
import { IPosition } from '@hell-pong/shared/entities/component/Position';

class TableButtonCell extends TableCell {
  private readonly button: Button;

  constructor(scene: Phaser.Scene, button: Button, width: number, offset: IPosition = { x: 0, y: 0 }) {
    super(scene, width, offset);
    this.button = button;
    this.add(this.createContent());
  }

  createContent(): Button {
    return this.button.setPosition(this._offset.x, this._offset.y).setOrigin(0);
  }
}
export default TableButtonCell;
