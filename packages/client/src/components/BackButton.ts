import Button from './Button';

export default class BackButton extends Button {
  constructor(scene: Phaser.Scene, onClick: () => void) {
    super(scene, 0, 0, 'button/back', onClick);
    this.sprite.setScale(0.5);
    this.setMarginBySize();
  }

  private setMarginBySize(): this {
    this.x = this.width * 0.5;
    this.y = this.height * 0.5;
    return this;
  }
}
