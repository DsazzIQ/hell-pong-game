import Phaser from 'phaser';
import { TableCell } from './TableCell';
import { IPosition } from '@hell-pong/shared/entities/component/Position';

class TableImageCell extends TableCell {
  private readonly imageKey: string;
  private readonly imageFrame: string;
  private readonly content: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    imageKey: string,
    imageFrame: string,
    width: number,
    offset: IPosition = { x: 0, y: 0 }
  ) {
    super(scene, width, offset);
    this.imageKey = imageKey;
    this.imageFrame = imageFrame;
    this.content = this.createContent();
    this.add(this.content);
  }

  createContent(): Phaser.GameObjects.Image {
    return new Phaser.GameObjects.Image(
      this.scene,
      this._offset.x,
      this._offset.y,
      this.imageKey,
      this.imageFrame
    ).setOrigin(0);
  }
}
export default TableImageCell;
