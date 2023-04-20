import Label from 'phaser3-rex-plugins/templates/ui/label/Label';
import { Input, Scene } from 'phaser';
import Color from '@hell-pong/shared/constants/color';
import TextureKey from '../../constants/TextureKey';
import SoundKey from '../../constants/SoundKey';

class DialogButton extends Label {
  private readonly _background: Phaser.GameObjects.Image;
  private readonly _shadow: Phaser.FX.Shadow | undefined;

  // constructor(scene: Scene, config) {
  constructor(scene: Scene, frame: string, onClick: () => void, highlight: Color) {
    const config: Label.IConfig = {
      align: 'center',
      width: 36,
      height: 36
    };

    super(scene, config);
    this.setInteractive({ useHandCursor: true });

    this._background = scene.add.image(0, 0, TextureKey.Gui.Key, frame);
    this.addBackground(this._background);
    this._shadow = this._background.preFX?.addShadow(0.5, 0.5, 0.25, 1, highlight);
    this.stopShadow();

    this.on(Input.Events.POINTER_DOWN, () => this._onClick(onClick));
    this.on(Input.Events.POINTER_OVER, () => this.onHoverState());
    this.on(Input.Events.POINTER_OUT, () => this.onOutState());

    scene.add.existing(this);
  }

  protected startShadow() {
    if (this._shadow) {
      this._shadow.active = true;
    }
  }

  protected stopShadow() {
    if (this._shadow) {
      this._shadow.active = false;
    }
  }

  protected playOnClick() {
    this.scene.sound.get(SoundKey.ButtonClick).play();
  }

  protected playOnHover() {
    this.scene.sound.get(SoundKey.ButtonHover).play();
  }

  public onHoverState() {
    this.playOnHover();
    this.startShadow();
  }

  public onOutState() {
    this.stopShadow();
  }

  protected _onClick(onClick: () => void) {
    this.playOnClick();
    onClick();
  }
}

export default DialogButton;
