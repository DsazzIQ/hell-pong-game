import Phaser from 'phaser';
import FontFamily from '../../constants/FontFamily';
import FontSize from '../../constants/FontSize';
import Color, { colorToHex } from '@hell-pong/shared/constants/color';
import { ISize } from '@hell-pong/shared/entities/component/Size';

class PaginationButton extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    height: number,
    text: string,
    disabled: boolean,
    selected: boolean,
    onClick?: () => void
  ) {
    super(scene);

    this.add(this.createBody(height, disabled, selected, onClick));
    this.add(this.createText(height, text));
  }

  private createBody(height: number, disabled: boolean, selected: boolean, onClick?: () => void) {
    const button = this.scene.add.graphics();
    const buttonColor = selected ? Color.Orange : disabled ? Color.Gray700 : Color.Gray800;

    const size: ISize = { width: height, height };
    button.fillStyle(buttonColor, 1);
    button.fillRect(0, 0, size.width, size.height);

    button.setInteractive(new Phaser.Geom.Rectangle(0, 0, height, height), Phaser.Geom.Rectangle.Contains);

    if (!disabled) {
      button.on(Phaser.Input.Events.POINTER_OVER, () => {
        this.scene.sys.canvas.style.cursor = 'pointer';
        this.updateButtonColor(button, Color.Gray600, size);
      });
      button.on(Phaser.Input.Events.POINTER_OUT, () => {
        this.scene.sys.canvas.style.cursor = 'default';
        this.updateButtonColor(button, buttonColor, size);
      });
      onClick && button.on(Phaser.Input.Events.POINTER_DOWN, onClick);
    }

    return button;
  }

  private updateButtonColor(button: Phaser.GameObjects.Graphics, color: Color, size: ISize) {
    button.clear();
    button.fillStyle(color, 1);
    button.fillRect(0, 0, size.width, size.height);
  }

  private createText(height: number, text: string) {
    return this.scene.add
      .text(height * 0.5, height * 0.5, text, {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText,
        color: colorToHex(Color.White)
      })
      .setOrigin(0.5);
  }
}

export default PaginationButton;
