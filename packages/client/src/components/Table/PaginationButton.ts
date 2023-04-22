import Phaser from 'phaser';
import FontFamily from '../../constants/FontFamily';
import FontSize from '../../constants/FontSize';
import Color, { colorToHex } from '@hell-pong/shared/constants/color';

class PaginationButton extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, height: number, index: number, disabled: boolean, onClick: () => void) {
    super(scene);

    this.add(this.createBody(height, disabled, onClick));
    this.add(this.createText(height, index));
  }

  private createBody(height: number, disabled: boolean, onClick: () => void) {
    const button = this.scene.add.graphics();
    const buttonColor = disabled ? 0xcccccc : 0xaaaaaa;
    button.fillStyle(buttonColor, 1);
    button.fillRect(0, 0, height, height);

    button.setInteractive(new Phaser.Geom.Rectangle(0, 0, height, height), Phaser.Geom.Rectangle.Contains);

    if (!disabled) {
      button.on(Phaser.Input.Events.POINTER_OVER, () => {
        this.scene.sys.canvas.style.cursor = 'pointer';
      });
      button.on(Phaser.Input.Events.POINTER_OUT, () => {
        this.scene.sys.canvas.style.cursor = 'default';
      });
      button.on(Phaser.Input.Events.POINTER_DOWN, onClick);
    }

    return button;
  }

  private createText(height: number, index: number) {
    return this.scene.add
      .text(height * 0.5, height * 0.5, `${index + 1}`, {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText,
        color: colorToHex(Color.White)
      })
      .setOrigin(0.5);
  }
}

export default PaginationButton;
