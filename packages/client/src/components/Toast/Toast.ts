import Phaser from 'phaser';
import TextureKey from '../../constants/TextureKey';
import FontFamily from '../../constants/FontFamily';
import Color, { colorToHex } from '@hell-pong/shared/constants/color';
import FontSize from '../../constants/FontSize';
import { GameConstant } from '@hell-pong/shared/constants/game';
import { IPosition } from '@hell-pong/shared/entities/component/Position';

export type ToastStatus = 'Error' | 'Info';

const TOAST_OFFSET: IPosition = { x: 10, y: 10 };
const ICON_OFFSET_X = 10;
const MESSAGE_OFFSET_X = 6;
const CLOSE_OFFSET = 8;
class Toast extends Phaser.GameObjects.Container {
  onClose?: () => void;
  isDestroyed = false;

  constructor(scene: Phaser.Scene, status: ToastStatus, message: string, poolSize: number) {
    super(scene, 0, 0);
    this.setAlpha(0);

    const bgImage = this.createBgImage(scene, status);
    this.setSize(bgImage.width, bgImage.height);

    const { x, y } = this.calculatePosition(poolSize);
    this.setPosition(x, y);

    const icon = this.createStatusIcon(scene, status);
    const text = this.createMessageText(scene, message, icon);
    const closeButton = this.createCloseButton(scene);

    this.add([bgImage, icon, text, closeButton]);
    scene.add.existing(this);
  }

  private createBgImage(scene: Phaser.Scene, status: ToastStatus) {
    const bgImage = scene.add.image(0, 0, TextureKey.Background.Key, TextureKey.Background.Frames.Toast[status]);
    bgImage.setOrigin(0, 0);
    bgImage.setAlpha(0.9);
    return bgImage;
  }

  private calculatePosition(poolSize: number): IPosition {
    const x = GameConstant.Width - this.width - TOAST_OFFSET.x;
    const y = poolSize * this.height + TOAST_OFFSET.y;
    return { x, y };
  }

  private createStatusIcon(scene: Phaser.Scene, status: ToastStatus) {
    const icon = scene.add.image(0, 0, TextureKey.Gui.Key, TextureKey.Gui.Frames.Icon[status]);
    icon.setOrigin(0, 0.5).setPosition(ICON_OFFSET_X, this.height * 0.5);
    return icon;
  }

  private createMessageText(scene: Phaser.Scene, message: string, icon: Phaser.GameObjects.Image) {
    const text = scene.add.text(0, 0, message, {
      wordWrap: { width: this.width - icon.width - TOAST_OFFSET.x * 2 },
      fontSize: FontSize.ExtraSmall,
      fontFamily: FontFamily.Text,
      lineSpacing: 10,
      color: colorToHex(Color.White)
    });
    text.setOrigin(0, 0.5).setPosition(icon.x + icon.width + MESSAGE_OFFSET_X, this.height * 0.5);
    return text;
  }

  private createCloseButton(scene: Phaser.Scene) {
    return scene.add
      .text(this.width - CLOSE_OFFSET, CLOSE_OFFSET, 'X', {
        fontSize: FontSize.ExtraSmall,
        fontFamily: FontFamily.Text,
        color: colorToHex(Color.White)
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.hide();
      });
  }

  show() {
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 500
    });
  }

  hide() {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.close();
      }
    });
  }

  close() {
    this.destroy();
    this.isDestroyed = true;

    if (this.onClose) {
      this.onClose();
    }
  }

  updateY(index: number) {
    this.setY(index * this.height + TOAST_OFFSET.y);
  }
}
export default Toast;
