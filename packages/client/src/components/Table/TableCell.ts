import Phaser from 'phaser';
import { IPosition } from '@hell-pong/shared/entities/component/Position';

export abstract class TableCell extends Phaser.GameObjects.Container {
  protected _cellWidth: number;
  protected _offset: IPosition;
  protected constructor(scene: Phaser.Scene, cellWidth: number, offset = { x: 0, y: 0 }) {
    super(scene);
    this._cellWidth = cellWidth;
    this._offset = offset;
  }

  get cellWidth(): number {
    return this._cellWidth;
  }

  protected abstract createContent(position: IPosition): Phaser.GameObjects.GameObject;
}
